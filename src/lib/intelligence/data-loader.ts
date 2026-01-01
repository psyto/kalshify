/**
 * Data Loader for Intelligence
 * Loads company data from JSON files when available, falls back to mock data
 */

import { Company } from "./companies";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Load company data from JSON file if it exists
 * @param slug - Company slug
 * @returns Company data from JSON or null if not found
 */
export function loadCompanyFromJson(slug: string): Company | null {
    try {
        const dataPath = join(
            process.cwd(),
            "data",
            "companies",
            `${slug}.json`
        );

        if (!existsSync(dataPath)) {
            return null;
        }

        const rawData = readFileSync(dataPath, "utf-8");
        const jsonData = JSON.parse(rawData);

        // Return the company object from the JSON file
        if (jsonData.company) {
            return jsonData.company as Company;
        }

        return null;
    } catch (error) {
        console.error(`Error loading company data for ${slug}:`, error);
        return null;
    }
}

/**
 * Check if a company has real JSON data available
 * @param slug - Company slug
 * @returns true if JSON file exists
 */
export function hasRealData(slug: string): boolean {
    const dataPath = join(process.cwd(), "data", "companies", `${slug}.json`);
    return existsSync(dataPath);
}

/**
 * Get all available JSON data files
 * @returns Array of company slugs that have real data
 */
export function getAvailableDataSlugs(): string[] {
    try {
        const dataDir = join(process.cwd(), "data", "companies");
        if (!existsSync(dataDir)) {
            return [];
        }

        const { readdirSync } = require("fs");
        const files = readdirSync(dataDir);

        return files
            .filter((file: string) => file.endsWith(".json"))
            .map((file: string) => file.replace(".json", ""));
    } catch (error) {
        console.error("Error reading data directory:", error);
        return [];
    }
}

/**
 * Load all companies from JSON files
 * @returns Array of Company objects from JSON files
 */
export function loadAllCompaniesFromJson(): Company[] {
    const slugs = getAvailableDataSlugs();
    const companies: Company[] = [];

    for (const slug of slugs) {
        const company = loadCompanyFromJson(slug);
        if (company) {
            companies.push(company);
        }
    }

    return companies;
}
