'use client';

import { useEffect, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

interface GitContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface GitStats {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  thisWeek: number;
}

interface GitHubContribResponse {
  date: string;
  count: number;
  level: number;
}

function GitActivityBlockComponent({
  block,
  isAdmin,
  isMobile,
}: BlockComponentProps) {
  const { content } = block;
  const [contributions, setContributions] = useState<GitContribution[]>([]);
  const [stats, setStats] = useState<GitStats>({
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  const contentRecord = content as Record<string, unknown>;
  const username =
    typeof contentRecord.username === 'string' ? contentRecord.username : '';
  const githubToken =
    typeof contentRecord.githubToken === 'string'
      ? contentRecord.githubToken
      : '';
  const showStats =
    typeof contentRecord.showStats === 'boolean'
      ? contentRecord.showStats
      : true;
  const timeframe =
    typeof contentRecord.timeframe === 'string'
      ? contentRecord.timeframe
      : 'year';

  const getTimeframeText = (timeframe: string): string => {
    switch (timeframe) {
      case 'year':
        return 'last year';
      case '6months':
        return 'last 6 months';
      case '3months':
        return 'last 3 months';
      default:
        return 'last year';
    }
  };

  const calculateStats = (contribs: GitContribution[]): GitStats => {
    const total = contribs.reduce((sum, day) => sum + day.count, 0);

    let currentStreak = 0;
    for (let i = contribs.length - 1; i >= 0; i--) {
      if (contribs[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    contribs.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const thisWeek = contribs
      .filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= startOfWeek;
      })
      .reduce((sum, day) => sum + day.count, 0);

    return {
      totalContributions: total,
      currentStreak,
      longestStreak,
      thisWeek,
    };
  };

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);

      if (!username) {
        setContributions([]);
        setStats({
          totalContributions: 0,
          currentStreak: 0,
          longestStreak: 0,
          thisWeek: 0,
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/github-contributions?username=${encodeURIComponent(username)}&timeframe=${encodeURIComponent(timeframe)}`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.contributions && data.contributions.length > 0) {
            const realData = data.contributions.map(
              (contrib: GitHubContribResponse) => ({
                date: contrib.date,
                count: contrib.count,
                level: contrib.level as 0 | 1 | 2 | 3 | 4,
              })
            );

            setContributions(realData);
            setStats(calculateStats(realData));
            setLoading(false);
            return;
          }
        }

        console.log('No GitHub contributions data available');
        setContributions([]);
        setStats({
          totalContributions: 0,
          currentStreak: 0,
          longestStreak: 0,
          thisWeek: 0,
        });
      } catch (error) {
        console.error('Failed to fetch GitHub contributions:', error);

        setContributions([]);
        setStats({
          totalContributions: 0,
          currentStreak: 0,
          longestStreak: 0,
          thisWeek: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [username, githubToken, timeframe]);

  if (!username && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500 rounded-xl">
        <div className="text-center">
          <FiActivity className="text-2xl mb-2 mx-auto" />
          <span>Configure Git Activity</span>
        </div>
      </div>
    );
  }

  const getContributionColor = (level: number): string => {
    const colors = [
      'bg-gray-100',
      'bg-green-200',
      'bg-green-300',
      'bg-green-500',
      'bg-green-700',
    ];
    return colors[level] || colors[0];
  };

  const createDateGrid = () => {
    const today = new Date();
    let days: number;

    switch (timeframe) {
      case '3months':
        days = 91;
        break;
      case '6months':
        days = 183;
        break;
      case 'year':
      default:
        days = 365;
        break;
    }

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);

    const contribMap = new Map<string, GitContribution>();
    contributions.forEach(contrib => {
      contribMap.set(contrib.date, contrib);
    });

    const allDates: GitContribution[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = contribMap.get(dateStr);

      allDates.push(
        existing || {
          date: dateStr,
          count: 0,
          level: 0 as 0 | 1 | 2 | 3 | 4,
        }
      );

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDates;
  };

  const dateGrid = createDateGrid();
  const weeks: GitContribution[][] = [];

  const firstDate = new Date(dateGrid[0]?.date || new Date());
  const firstSunday = new Date(firstDate);
  firstSunday.setDate(firstDate.getDate() - firstDate.getDay());

  let weekStart = 0;

  if (firstDate.getDay() !== 0) {
    const firstWeek: GitContribution[] = [];

    for (let i = 0; i < firstDate.getDay(); i++) {
      firstWeek.push({
        date: '',
        count: 0,
        level: 0 as 0 | 1 | 2 | 3 | 4,
      });
    }

    while (firstWeek.length < 7 && weekStart < dateGrid.length) {
      firstWeek.push(dateGrid[weekStart]);
      weekStart++;
    }

    weeks.push(firstWeek);
  }

  for (let i = weekStart; i < dateGrid.length; i += 7) {
    const week: GitContribution[] = [];
    for (let j = 0; j < 7 && i + j < dateGrid.length; j++) {
      week.push(dateGrid[i + j]);
    }

    while (week.length < 7) {
      week.push({
        date: '',
        count: 0,
        level: 0 as 0 | 1 | 2 | 3 | 4,
      });
    }

    weeks.push(week);
  }

  const getMonthHeaders = () => {
    if (weeks.length === 0) return [];

    const headers: Array<{ month: string; colSpan: number; position: number }> =
      [];
    let currentMonth = '';
    let colSpan = 0;
    let position = 0;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day.date !== '');

      if (firstValidDay) {
        const monthName = new Date(firstValidDay.date).toLocaleString(
          'default',
          { month: 'short' }
        );

        if (monthName !== currentMonth) {
          if (currentMonth && colSpan > 0) {
            headers.push({ month: currentMonth, colSpan, position });
          }
          currentMonth = monthName;
          colSpan = 1;
          position = weekIndex;
        } else {
          colSpan++;
        }
      }
    });

    if (currentMonth && colSpan > 0) {
      headers.push({ month: currentMonth, colSpan, position });
    }

    return headers;
  };

  const monthHeaders = getMonthHeaders();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const containerPadding = isAdmin && isMobile ? 'p-2' : 'p-4';

  return (
    <div
      className={`${containerPadding} h-full w-full bg-white rounded-xl overflow-x-auto overflow-y-hidden border border-gray-200`}
    >
      <div className="h-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            { }
            {/* GitHub-style Contribution Graph */}
            <div
              className="flex-1 flex flex-col justify-center overflow-x-auto overflow-y-hidden"
              style={{
                paddingLeft: '8px',
                paddingRight: '8px',
              }}
            >
              <div style={{ minWidth: 'max-content', width: 'max-content' }}>
                <table
                  className="w-full"
                  style={{ overflow: 'visible', tableLayout: 'auto' }}
                >
                  { }
                  <thead>
                    <tr style={{ height: '15px' }}>
                      <td style={{ width: '32px' }}>
                        <span className="sr-only">Day of Week</span>
                      </td>
                      {monthHeaders.map((header, index) => (
                        <td
                          key={index}
                          className="text-xs text-gray-600"
                          colSpan={header.colSpan}
                          style={{
                            position: 'relative',
                            paddingBottom: '5px',
                          }}
                        >
                          <span className="sr-only">{header.month}</span>
                          <span
                            aria-hidden="true"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: '0',
                              fontSize: '11px',
                            }}
                          >
                            {header.month}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </thead>

                  { }
                  <tbody>
                    {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                      <tr key={dayIndex} style={{ height: '10px' }}>
                        <td
                          className="text-xs text-gray-600"
                          style={{ position: 'relative' }}
                        >
                          <span className="sr-only">{dayLabels[dayIndex]}</span>
                          { }
                          {(dayIndex === 1 ||
                            dayIndex === 3 ||
                            dayIndex === 5) && (
                              <span
                                aria-hidden="true"
                                style={{
                                  position: 'absolute',
                                  bottom: '-3px',
                                  fontSize: '10px',
                                }}
                              >
                                {dayLabels[dayIndex]}
                              </span>
                            )}
                        </td>
                        {weeks.map((week, weekIndex) => {
                          const day = week[dayIndex];
                          const isEmpty = !day || !day.date;

                          return (
                            <td
                              key={weekIndex}
                              style={{
                                padding: '1px',
                              }}
                            >
                              <div
                                className={`transition-colors ${isEmpty
                                  ? 'bg-transparent'
                                  : day.level > 0
                                    ? getContributionColor(day.level)
                                    : 'bg-gray-100'
                                  }`}
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '2px',
                                }}
                                title={
                                  isEmpty
                                    ? ''
                                    : day.count > 0
                                      ? `${day.count} contributions on ${day.date}`
                                      : `No contributions on ${day.date}`
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="text-center mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600">
                  {stats.totalContributions} contributions in the{' '}
                  {getTimeframeText(timeframe)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const config: BlockConfig = {
  type: 'git-activity',
  name: 'Git Activity',
  icon: 'FiActivity',
  description: 'GitHub-style contribution activity graph',
  defaultSize: 'wide',
  supportedSizes: ['wide'],
  category: 'developer',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'username',
      label: 'GitHub Username',
      type: 'text',
      required: true,
      placeholder: 'octocat',
      help: 'Your GitHub username to display activity for',
      validation: {
        pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$|^[a-zA-Z0-9]$',
        message: 'Please enter a valid GitHub username',
        max: 39,
      },
    },
    {
      key: 'githubToken',
      label: 'GitHub Token (Optional)',
      type: 'password',
      placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      help: 'Personal access token for private repos (optional)',
      validation: {
        pattern: '^$|^ghp_[a-zA-Z0-9]{36}$|^github_pat_[a-zA-Z0-9_]{82}$',
        message: 'Please enter a valid GitHub personal access token',
      },
    },
    {
      key: 'showStats',
      label: 'Show Statistics',
      type: 'checkbox',
      defaultValue: true,
      help: 'Display contribution statistics below the graph',
    },
    {
      key: 'timeframe',
      label: 'Timeframe',
      type: 'select',
      defaultValue: 'year',
      options: [
        { value: 'year', label: 'Last Year' },
        { value: '6months', label: 'Last 6 Months' },
        { value: '3months', label: 'Last 3 Months' },
      ],
      help: 'Choose the time period to display',
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const username = typeof data.username === 'string' ? data.username : '';

    if (!username) {
      return 'GitHub username is required';
    }

    if (username.length > 39) {
      return 'GitHub username must be 39 characters or less';
    }

    if (
      !/^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(username)
    ) {
      return 'Invalid GitHub username format';
    }

    return null;
  },
};

const getDefaultContent = () => ({
  username: '',
  githubToken: '',
  showStats: true,
  timeframe: 'year',
});

function GitActivityPreviewComponent() {
  return (
    <div className="p-3 border rounded bg-white">
      <div className="flex items-center gap-2 mb-2">
        <FiActivity className="text-gray-600" />
        <div className="font-medium text-sm">Git Activity Graph</div>
      </div>
      <div className="grid grid-flow-col gap-[1px] mb-2">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="grid grid-rows-7 gap-[1px]">
            {Array.from({ length: 7 }, (_, j) => (
              <div
                key={j}
                className={`w-1 h-1 rounded-sm ${Math.random() > 0.7
                  ? 'bg-green-400'
                  : Math.random() > 0.5
                    ? 'bg-green-200'
                    : 'bg-gray-100'
                  }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">Contribution activity graph</div>
    </div>
  );
}

export const blockModule: BlockModule = {
  config,
  Component: GitActivityBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: GitActivityPreviewComponent,
};

export default GitActivityBlockComponent;
