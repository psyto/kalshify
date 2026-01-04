"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Check, Github, Globe, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Company {
  slug: string;
  name: string;
  category: string;
  description: string | null;
  logo: string | null;
  overallScore: number;
}

interface Props {
  companies: Company[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export function ClaimCompanyClient({ companies, user }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleGitHubClaim = async () => {
    if (!selectedCompany) return;

    if (!githubUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter your GitHub username",
        variant: "destructive",
      });
      return;
    }

    setClaiming(true);
    try {
      const response = await fetch("/api/profile/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: selectedCompany.slug,
          verificationType: "github",
          verificationProof: `GitHub: ${githubUsername.trim()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim company");
      }

      // Auto-verify for MVP (in production, GitHub org membership would be checked)
      const verifyResponse = await fetch("/api/profile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: selectedCompany.slug,
          verificationProof: `GitHub verified: ${githubUsername.trim()} (MVP auto-approved)`,
        }),
      });

      if (!verifyResponse.ok) {
        console.error("Auto-verification failed, but claim succeeded");
      }

      toast({
        title: "Success!",
        description: `You've claimed ${selectedCompany.name}. You can now access Synergy features.`,
      });

      // Refresh the page to show the claimed profile
      router.refresh();
      router.push("/synergy/discover");
    } catch (error) {
      console.error("Error claiming company:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to claim company",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleDomainClaim = async () => {
    toast({
      title: "Coming Soon",
      description: "Domain verification will be available soon. Use GitHub verification for now.",
    });
  };

  const handleWalletClaim = async () => {
    toast({
      title: "Coming Soon",
      description: "Wallet verification will be available soon. Use GitHub verification for now.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Claim Your Company</h1>
        <p className="text-muted-foreground">
          To access Synergy features and find partnership opportunities, please
          claim your company profile.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company List */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <h2 className="font-semibold">
              Available Companies ({filteredCompanies.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No companies found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredCompanies.map((company) => (
                  <button
                    key={company.slug}
                    onClick={() => setSelectedCompany(company)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedCompany?.slug === company.slug
                        ? "bg-green-50 border-l-4 border-green-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {company.logo ? (
                        company.logo.startsWith("http") ||
                        company.logo.startsWith("/") ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-2xl">
                            {company.logo}
                          </div>
                        )
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {company.name}
                          </h3>
                          {selectedCompany?.slug === company.slug && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {company.category}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Score: {company.overallScore}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Company Preview */}
        <div className="bg-card rounded-lg border border-border p-6">
          {selectedCompany ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {selectedCompany.logo ? (
                  selectedCompany.logo.startsWith("http") ||
                  selectedCompany.logo.startsWith("/") ? (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center text-4xl">
                      {selectedCompany.logo}
                    </div>
                  )
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {selectedCompany.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedCompany.category}
                  </p>
                </div>
              </div>

              {selectedCompany.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="mt-1 text-sm">{selectedCompany.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Overall Score
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${selectedCompany.overallScore}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {selectedCompany.overallScore}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-3">Claim This Company</h3>

                <Tabs defaultValue="github" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="github">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </TabsTrigger>
                    <TabsTrigger value="domain" disabled>
                      <Globe className="mr-2 h-4 w-4" />
                      Domain
                    </TabsTrigger>
                    <TabsTrigger value="wallet" disabled>
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </TabsTrigger>
                  </TabsList>

                  {/* GitHub Verification */}
                  <TabsContent value="github" className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enter your GitHub username to verify you represent{" "}
                        <strong>{selectedCompany.name}</strong>.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="github-username">Your GitHub Username</Label>
                      <Input
                        id="github-username"
                        placeholder="octocat"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        disabled={claiming}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: MVP auto-approves. In production, we verify org membership.
                      </p>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                      <p className="text-sm font-medium">How it works:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Enter your GitHub username</li>
                        <li>We verify your identity (MVP: auto-approved)</li>
                        <li>You get access to Synergy partnership features</li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleGitHubClaim}
                      disabled={claiming || !githubUsername.trim()}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {claiming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify & Claim Profile
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Domain Verification */}
                  <TabsContent value="domain" className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">
                        This verification method is coming soon. Please use GitHub
                        verification for now.
                      </p>
                    </div>
                    <Button onClick={handleDomainClaim} disabled className="w-full">
                      Coming Soon
                    </Button>
                  </TabsContent>

                  {/* Wallet Verification */}
                  <TabsContent value="wallet" className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">
                        This verification method is coming soon. Please use GitHub
                        verification for now.
                      </p>
                    </div>
                    <Button onClick={handleWalletClaim} disabled className="w-full">
                      Coming Soon
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
              <Building2 className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No Company Selected</p>
              <p className="text-sm mt-2">
                Select a company from the list to view details and claim it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
