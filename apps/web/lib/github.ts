// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  websiteUrl?: string;
  company?: string;
  location?: string;
  email?: string;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubContributionWeek {
  days: GitHubContributionDay[];
}

export interface GitHubContributionCalendar {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
}

export interface GitHubLanguage {
  name: string;
  color: string;
  size: number;
}

export interface GitHubRepo {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string } | null;
  updatedAt: string;
  isPrivate: boolean;
  isFork: boolean;
  topics: string[];
  openIssuesCount: number;
}

export interface GitHubStats {
  user: GitHubUser;
  totalContributions: number;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  topLanguages: GitHubLanguage[];
  pinnedRepos: GitHubRepo[];
  contributionCalendar: GitHubContributionCalendar;
}

// ─── GraphQL Queries ───────────────────────────────────────────────────────────

const USER_STATS_QUERY = `
  query UserStats($username: String!) {
    user(login: $username) {
      login
      name
      avatarUrl
      bio
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        totalCount
        nodes {
          stargazerCount
          forkCount
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoriesWithContributedCommits
      }
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            id
            name
            nameWithOwner
            description
            url
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
            updatedAt
            isPrivate
            isFork
            repositoryTopics(first: 5) {
              nodes {
                topic {
                  name
                }
              }
            }
            issues(states: OPEN) {
              totalCount
            }
          }
        }
      }
    }
  }
`;

const CONTRIBUTIONS_QUERY = `
  query Contributions($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const REPOS_QUERY = `
  query Repos($username: String!, $cursor: String) {
    user(login: $username) {
      repositories(
        first: 30
        after: $cursor
        ownerAffiliations: OWNER
        orderBy: { field: UPDATED_AT, direction: DESC }
        privacy: PUBLIC
      ) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          name
          nameWithOwner
          description
          url
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          updatedAt
          isPrivate
          isFork
          repositoryTopics(first: 5) {
            nodes {
              topic {
                name
              }
            }
          }
          issues(states: OPEN) {
            totalCount
          }
        }
      }
    }
  }
`;

// ─── GitHub GraphQL Fetcher ────────────────────────────────────────────────────

async function githubGraphQL<T = any>(
  query: string,
  variables: Record<string, any>,
  accessToken: string,
): Promise<T> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-REQUEST-TYPE': 'GraphQL',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((e: any) => e.message).join(', '));
  }

  return json.data as T;
}

// ─── Contribution Level Mapper ─────────────────────────────────────────────────

function mapContributionLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  const map: Record<string, 0 | 1 | 2 | 3 | 4> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };
  return map[level] ?? 0;
}

// ─── fetchUserStats ────────────────────────────────────────────────────────────

export async function fetchUserStats(
  username: string,
  accessToken: string,
): Promise<GitHubStats> {
  const data = await githubGraphQL<{ user: any }>(
    USER_STATS_QUERY,
    { username },
    accessToken,
  );

  const user = data.user;
  if (!user) throw new Error(`GitHub user '${username}' not found`);

  // Aggregate language sizes
  const languageMap: Record<string, { name: string; color: string; size: number }> = {};
  for (const repo of user.repositories.nodes) {
    for (const edge of (repo.languages?.edges ?? [])) {
      const lang = edge.node.name;
      if (!languageMap[lang]) {
        languageMap[lang] = { name: lang, color: edge.node.color ?? '#6366f1', size: 0 };
      }
      languageMap[lang].size += edge.size;
    }
  }
  const topLanguages = Object.values(languageMap)
    .sort((a, b) => b.size - a.size)
    .slice(0, 8);

  // Aggregate stars / forks
  const totalStars = user.repositories.nodes.reduce(
    (sum: number, r: any) => sum + r.stargazerCount,
    0,
  );
  const totalForks = user.repositories.nodes.reduce(
    (sum: number, r: any) => sum + r.forkCount,
    0,
  );

  // Map contribution calendar
  const calendar = user.contributionsCollection.contributionCalendar;
  const weeks: GitHubContributionWeek[] = calendar.weeks.map((week: any) => ({
    days: week.contributionDays.map((day: any) => ({
      date: day.date,
      count: day.contributionCount,
      level: mapContributionLevel(day.contributionLevel),
    })),
  }));

  // Map pinned repos
  const pinnedRepos: GitHubRepo[] = (user.pinnedItems?.nodes ?? []).map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description,
    url: repo.url,
    stargazerCount: repo.stargazerCount,
    forkCount: repo.forkCount,
    primaryLanguage: repo.primaryLanguage,
    updatedAt: repo.updatedAt,
    isPrivate: repo.isPrivate,
    isFork: repo.isFork,
    topics: (repo.repositoryTopics?.nodes ?? []).map((t: any) => t.topic.name),
    openIssuesCount: repo.issues?.totalCount ?? 0,
  }));

  return {
    user: {
      login: user.login,
      name: user.name ?? user.login,
      avatarUrl: user.avatarUrl,
      bio: user.bio ?? '',
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      publicRepos: user.repositories.totalCount,
    },
    totalContributions: calendar.totalContributions,
    totalStars,
    totalForks,
    totalRepos: user.repositories.totalCount,
    topLanguages,
    pinnedRepos,
    contributionCalendar: {
      totalContributions: calendar.totalContributions,
      weeks,
    },
  };
}

// ─── fetchContributions ────────────────────────────────────────────────────────

export async function fetchContributions(
  username: string,
  accessToken: string,
): Promise<GitHubContributionCalendar> {
  const data = await githubGraphQL<{ user: any }>(
    CONTRIBUTIONS_QUERY,
    { username },
    accessToken,
  );

  const calendar = data.user.contributionsCollection.contributionCalendar;

  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week: any) => ({
      days: week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: mapContributionLevel(day.contributionLevel),
      })),
    })),
  };
}

// ─── fetchRepos ────────────────────────────────────────────────────────────────

export async function fetchRepos(
  username: string,
  accessToken: string,
  limit = 30,
): Promise<GitHubRepo[]> {
  const data = await githubGraphQL<{ user: any }>(
    REPOS_QUERY,
    { username, cursor: null },
    accessToken,
  );

  return (data.user.repositories.nodes as any[])
    .slice(0, limit)
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      nameWithOwner: repo.nameWithOwner,
      description: repo.description,
      url: repo.url,
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      primaryLanguage: repo.primaryLanguage,
      updatedAt: repo.updatedAt,
      isPrivate: repo.isPrivate,
      isFork: repo.isFork,
      topics: (repo.repositoryTopics?.nodes ?? []).map((t: any) => t.topic.name),
      openIssuesCount: repo.issues?.totalCount ?? 0,
    }));
}

// ─── fetchUserProfile (REST fallback) ─────────────────────────────────────────

export async function fetchUserProfile(
  username: string,
  accessToken: string,
): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub REST API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    login: data.login,
    name: data.name ?? data.login,
    avatarUrl: data.avatar_url,
    bio: data.bio ?? '',
    followers: data.followers,
    following: data.following,
    publicRepos: data.public_repos,
    websiteUrl: data.blog,
    company: data.company,
    location: data.location,
    email: data.email,
  };
}
