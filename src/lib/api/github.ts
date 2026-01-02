/**
 * GitHub API Client
 * Fetches team health metrics: commits, contributors, activity
 */

import {
    GitHubRepoStats,
    GitHubContributor,
    GitHubCommitActivity,
    GitHubTeamMetrics,
} from "./types";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN =
    process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;

interface GitHubAPIOptions {
    token?: string;
}

/**
 * Make authenticated GitHub API request
 */
async function githubFetch(
    endpoint: string,
    options?: GitHubAPIOptions
): Promise<any> {
    const token = options?.token || GITHUB_TOKEN;

    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(
            `GitHub API error: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}

/**
 * Get repository stats
 */
export async function getRepoStats(
    owner: string,
    repo: string
): Promise<GitHubRepoStats> {
    const data = await githubFetch(`/repos/${owner}/${repo}`);

    return {
        name: data.name,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        watchers: data.watchers_count,
        language: data.language,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
    };
}

/**
 * Get contributors
 */
export async function getContributors(
    owner: string,
    repo: string,
    limit = 100
): Promise<GitHubContributor[]> {
    const data = await githubFetch(
        `/repos/${owner}/${repo}/contributors?per_page=${limit}`
    );

    return data.map((contributor: any) => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatarUrl: contributor.avatar_url,
    }));
}

/**
 * Get commit activity (last 52 weeks)
 */
export async function getCommitActivity(
    owner: string,
    repo: string
): Promise<GitHubCommitActivity[]> {
    const data = await githubFetch(
        `/repos/${owner}/${repo}/stats/commit_activity`
    );

    if (!data || !Array.isArray(data)) {
        return [];
    }

    return data.map((week: any) => ({
        week: week.week,
        total: week.total,
        days: week.days,
    }));
}

/**
 * Get commits in the last N days
 */
export async function getRecentCommits(
    owner: string,
    repo: string,
    days = 30
): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
        const data = await githubFetch(
            `/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=1`
        );

        // GitHub returns Link header with pagination info
        // For now, we'll use commit activity as a more reliable source
        const activity = await getCommitActivity(owner, repo);

        // Calculate commits in last N days
        const daysInWeeks = Math.ceil(days / 7);
        const recentActivity = activity.slice(-daysInWeeks);

        return recentActivity.reduce((sum, week) => sum + week.total, 0);
    } catch (error) {
        console.error("Error fetching recent commits:", error);
        return 0;
    }
}

/**
 * Get active contributors in the last N days
 */
export async function getActiveContributors(
    owner: string,
    repo: string,
    days = 30
): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
        // Get recent commits with author info
        const commits = await githubFetch(
            `/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`
        );

        // Count unique authors
        const uniqueAuthors = new Set();
        commits.forEach((commit: any) => {
            if (commit.author?.login) {
                uniqueAuthors.add(commit.author.login);
            }
        });

        return uniqueAuthors.size;
    } catch (error) {
        console.error("Error fetching active contributors:", error);
        return 0;
    }
}

/**
 * Get comprehensive team metrics
 */
export async function getTeamMetrics(
    owner: string,
    repo: string
): Promise<GitHubTeamMetrics> {
    try {
        const [
            contributors,
            commitActivity,
            commits30d,
            activeContributors30d,
        ] = await Promise.all([
            getContributors(owner, repo, 100),
            getCommitActivity(owner, repo),
            getRecentCommits(owner, repo, 30),
            getActiveContributors(owner, repo, 30),
        ]);

        // Calculate average commits per day (last 30 days)
        const avgCommitsPerDay = commits30d / 30;

        return {
            totalContributors: contributors.length,
            activeContributors30d: activeContributors30d,
            totalCommits30d: commits30d,
            avgCommitsPerDay: Math.round(avgCommitsPerDay * 10) / 10,
            topContributors: contributors.slice(0, 10),
            commitActivity,
        };
    } catch (error) {
        console.error("Error fetching team metrics:", error);
        return {
            totalContributors: 0,
            activeContributors30d: 0,
            totalCommits30d: 0,
            avgCommitsPerDay: 0,
            topContributors: [],
            commitActivity: [],
        };
    }
}

/**
 * Get organization-level metrics (aggregates across all repos)
 * Useful when a project spans multiple repositories
 */
export async function getOrganizationMetrics(
    org: string
): Promise<GitHubTeamMetrics> {
    try {
        // Get all repositories for the organization
        const repos = await githubFetch(
            `/orgs/${org}/repos?per_page=100&sort=updated`
        );

        if (!repos || repos.length === 0) {
            throw new Error(`No repositories found for organization: ${org}`);
        }

        // Get metrics from all repos in parallel (limit to top 10 most active)
        const topRepos = repos
            .sort((a: any, b: any) => (b.updated_at > a.updated_at ? 1 : -1))
            .slice(0, 10); // Top 10 most recently updated repos

        const repoMetrics = await Promise.allSettled(
            topRepos.map((repo: any) =>
                getTeamMetrics(org, repo.name).catch(() => null)
            )
        );

        // Aggregate metrics across all repos
        let totalContributors = 0;
        let totalCommits30d = 0;
        const allContributors = new Set<string>();
        const allCommitActivity: GitHubCommitActivity[] = [];

        repoMetrics.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
                const metrics = result.value;
                totalContributors += metrics.totalContributors;
                totalCommits30d += metrics.totalCommits30d;

                metrics.topContributors.forEach(
                    (contributor: GitHubContributor) => {
                        allContributors.add(contributor.login);
                    }
                );

                // Merge commit activity (sum by week)
                metrics.commitActivity.forEach((week: GitHubCommitActivity) => {
                    const existing = allCommitActivity.find(
                        (w) => w.week === week.week
                    );
                    if (existing) {
                        existing.total += week.total;
                        week.days.forEach((day: number, idx: number) => {
                            existing.days[idx] =
                                (existing.days[idx] || 0) + day;
                        });
                    } else {
                        allCommitActivity.push({
                            ...week,
                            days: [...week.days],
                        });
                    }
                });
            }
        });

        // Calculate active contributors (unique across all repos)
        const activeContributors30d = allContributors.size;
        const avgCommitsPerDay = totalCommits30d / 30;

        return {
            totalContributors: allContributors.size,
            activeContributors30d,
            totalCommits30d,
            avgCommitsPerDay: Math.round(avgCommitsPerDay * 10) / 10,
            topContributors: Array.from(allContributors)
                .slice(0, 10)
                .map((login) => ({
                    login,
                    contributions: 0, // Would need to aggregate
                    avatarUrl: "",
                })),
            commitActivity: allCommitActivity.sort((a, b) => a.week - b.week),
        };
    } catch (error) {
        console.error("Error fetching organization metrics:", error);
        throw error;
    }
}

/**
 * Uniswap-specific: Get organization-level metrics (aggregates across all repos)
 */
export async function getUniswapMetrics(): Promise<GitHubTeamMetrics> {
    return getOrganizationMetrics("Uniswap");
}
/**
 * Fabrknt-specific: Get organization-level metrics (aggregates across all repos)
 */
export async function getFabrkntMetrics(): Promise<GitHubTeamMetrics> {
    return getOrganizationMetrics("fabrknt");
}
