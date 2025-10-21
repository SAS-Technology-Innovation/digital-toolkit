/**
 * SAS Digital Toolkit Dashboard Widget for Mintlify
 *
 * This React component fetches data from Google Apps Script and renders
 * the dashboard directly in Mintlify MDX pages (no iframe needed).
 *
 * Usage in MDX:
 * ```mdx
 * import DashboardWidget from './path/to/DashboardWidget';
 *
 * <DashboardWidget apiUrl="YOUR_APPS_SCRIPT_WEB_APP_URL" />
 * ```
 */

import React, { useState, useEffect } from 'react';

const DashboardWidget = ({
  apiUrl,
  defaultDivision = 'wholeSchool',
  showHeader = true,
  compact = false
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultDivision);

  useEffect(() => {
    fetchDashboardData();
  }, [apiUrl]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch from Google Apps Script
      const response = await fetch(`${apiUrl}?action=getDashboardData`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const textData = await response.text();
      const jsonData = JSON.parse(textData);

      if (jsonData.error) {
        throw new Error(jsonData.error);
      }

      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentIcon = (department) => {
    const dept = department.toLowerCase();
    if (dept.includes('tech') || dept.includes('it')) return '💻';
    if (dept.includes('english') || dept.includes('language')) return '📚';
    if (dept.includes('math')) return '🔢';
    if (dept.includes('science')) return '🔬';
    if (dept.includes('art') || dept.includes('music') || dept.includes('drama')) return '🎨';
    if (dept.includes('pe') || dept.includes('physical') || dept.includes('athletic')) return '⚽';
    if (dept.includes('library')) return '📖';
    if (dept.includes('counseling')) return '❤️';
    return '📁';
  };

  const AppCard = ({ app }) => (
    <div className="toolkit-app-card">
      <a
        href={app.website}
        target="_blank"
        rel="noopener noreferrer"
        className="toolkit-app-link"
      >
        <h4 className="toolkit-app-name">{app.product}</h4>
      </a>
      <div className="toolkit-app-tags">
        {app.category && (
          <span className="toolkit-tag toolkit-tag-category">{app.category}</span>
        )}
        {app.subject && (
          <span className="toolkit-tag toolkit-tag-subject">{app.subject}</span>
        )}
        {app.licenseType && (
          <span className="toolkit-tag toolkit-tag-license">{app.licenseType}</span>
        )}
      </div>
    </div>
  );

  const DepartmentCard = ({ department, apps }) => (
    <div className="toolkit-department-card">
      <div className="toolkit-department-header">
        <h3 className="toolkit-department-title">
          <span className="toolkit-department-icon">{getDepartmentIcon(department)}</span>
          {department}
        </h3>
        <span className="toolkit-department-count">{apps.length}</span>
      </div>
      <div className="toolkit-department-apps">
        {apps.map((app, idx) => (
          <AppCard key={idx} app={app} />
        ))}
      </div>
    </div>
  );

  const DivisionContent = ({ divisionData, division }) => {
    if (!divisionData) return null;

    const everyoneApps = divisionData.everyoneApps || [];
    const departments = divisionData.byDepartment || {};

    return (
      <div className={`toolkit-division-content toolkit-${division}`}>
        {/* Everyone Apps Section */}
        <div className="toolkit-everyone-section">
          <h2 className="toolkit-section-title">
            <span className="toolkit-icon">👥</span>
            {division === 'wholeSchool'
              ? 'Apps Everyone Can Use'
              : `Core Apps for ${getDivisionName(division)}`
            }
          </h2>
          <p className="toolkit-section-subtitle">
            {division === 'wholeSchool'
              ? 'These core applications are available to the entire SAS community.'
              : `These applications are available to all ${getDivisionName(division).toLowerCase()} students and staff.`
            }
          </p>
          <div className="toolkit-apps-grid">
            {everyoneApps.length > 0 ? (
              everyoneApps.map((app, idx) => <AppCard key={idx} app={app} />)
            ) : (
              <p className="toolkit-empty">No core apps found for this division.</p>
            )}
          </div>
        </div>

        {/* Departments Section */}
        {Object.keys(departments).length > 0 && (
          <div className="toolkit-departments-section">
            <h3 className="toolkit-section-title">
              <span className="toolkit-icon">🏢</span>
              {division === 'wholeSchool'
                ? 'Department-Specific Apps'
                : `${getDivisionName(division)} Department Apps`
              }
            </h3>
            <div className="toolkit-departments-grid">
              {Object.entries(departments)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([dept, apps]) => (
                  <DepartmentCard key={dept} department={dept} apps={apps} />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getDivisionName = (division) => {
    const names = {
      wholeSchool: 'Whole School',
      elementary: 'Elementary School',
      middleSchool: 'Middle School',
      highSchool: 'High School'
    };
    return names[division] || division;
  };

  const tabs = [
    { id: 'wholeSchool', name: 'Whole School', icon: '🌍' },
    { id: 'elementary', name: 'Elementary', icon: '👶' },
    { id: 'middleSchool', name: 'Middle School', icon: '🎓' },
    { id: 'highSchool', name: 'High School', icon: '🏫' }
  ];

  if (loading) {
    return (
      <div className="toolkit-loading">
        <div className="toolkit-spinner"></div>
        <h3>Loading Dashboard...</h3>
        <p>Please wait while we fetch the digital toolkit data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toolkit-error">
        <h3>⚠️ Error Loading Dashboard</h3>
        <p>{error}</p>
        <p>Please try refreshing the page. If the problem persists, contact support.</p>
      </div>
    );
  }

  return (
    <div className={`toolkit-widget ${compact ? 'toolkit-compact' : ''}`}>
      {showHeader && (
        <div className="toolkit-header">
          <h1>SAS Digital Toolkit</h1>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="toolkit-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`toolkit-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            data-tab={tab.id}
          >
            <span className="toolkit-tab-icon">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="toolkit-content">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`toolkit-tab-content ${activeTab === tab.id ? 'active' : ''}`}
          >
            {activeTab === tab.id && (
              <DivisionContent
                divisionData={data?.[tab.id]}
                division={tab.id}
              />
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .toolkit-widget {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          background: #f8f9fc;
          border-radius: 12px;
          overflow: hidden;
          margin: 2rem 0;
        }

        .toolkit-header {
          background: linear-gradient(135deg, #192f59 0%, #295c9c 100%);
          color: white;
          padding: 1.5rem;
          text-align: center;
        }

        .toolkit-header h1 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 600;
        }

        .toolkit-tabs {
          display: flex;
          background: #192f59;
          border-bottom: 3px solid #295c9c;
          overflow-x: auto;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .toolkit-tab {
          flex: 1;
          min-width: 160px;
          padding: 0.875rem 1rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .toolkit-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .toolkit-tab.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .toolkit-tab[data-tab="wholeSchool"].active {
          border-bottom-color: #6f42c1;
        }

        .toolkit-tab[data-tab="elementary"].active {
          border-bottom-color: #28a745;
        }

        .toolkit-tab[data-tab="middleSchool"].active {
          border-bottom-color: #dc3545;
        }

        .toolkit-tab[data-tab="highSchool"].active {
          border-bottom-color: #007bff;
        }

        .toolkit-tab-icon {
          font-size: 1rem;
        }

        .toolkit-content {
          padding: 1.5rem;
          background: white;
        }

        .toolkit-tab-content {
          display: none;
        }

        .toolkit-tab-content.active {
          display: block;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .toolkit-everyone-section {
          background: linear-gradient(135deg, #f8f9fc, #ffffff);
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .toolkit-section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toolkit-wholeSchool .toolkit-section-title { color: #6f42c1; }
        .toolkit-elementary .toolkit-section-title { color: #28a745; }
        .toolkit-middleSchool .toolkit-section-title { color: #dc3545; }
        .toolkit-highSchool .toolkit-section-title { color: #007bff; }

        .toolkit-section-subtitle {
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .toolkit-icon {
          font-size: 1.25rem;
        }

        .toolkit-apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
          gap: 1rem;
        }

        .toolkit-app-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .toolkit-app-card:hover {
          border-color: #192f59;
          box-shadow: 0 4px 12px rgba(25, 47, 89, 0.15);
          transform: translateY(-2px);
        }

        .toolkit-app-link {
          text-decoration: none;
          color: inherit;
        }

        .toolkit-app-name {
          color: #192f59;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .toolkit-app-link:hover .toolkit-app-name {
          color: #295c9c;
          text-decoration: underline;
        }

        .toolkit-app-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.75rem;
        }

        .toolkit-tag {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .toolkit-tag-category {
          background: #e0e7ff;
          color: #3730a3;
        }

        .toolkit-tag-subject {
          background: #d1fae5;
          color: #047857;
        }

        .toolkit-tag-license {
          background: #ffedd5;
          color: #9a3412;
        }

        .toolkit-departments-section {
          margin-top: 2.5rem;
        }

        .toolkit-departments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .toolkit-department-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .toolkit-department-card:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .toolkit-wholeSchool .toolkit-department-card:hover { border-color: #6f42c1; }
        .toolkit-elementary .toolkit-department-card:hover { border-color: #28a745; }
        .toolkit-middleSchool .toolkit-department-card:hover { border-color: #dc3545; }
        .toolkit-highSchool .toolkit-department-card:hover { border-color: #007bff; }

        .toolkit-department-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f3f5;
        }

        .toolkit-department-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toolkit-wholeSchool .toolkit-department-title { color: #6f42c1; }
        .toolkit-elementary .toolkit-department-title { color: #28a745; }
        .toolkit-middleSchool .toolkit-department-title { color: #dc3545; }
        .toolkit-highSchool .toolkit-department-title { color: #007bff; }

        .toolkit-department-icon {
          font-size: 1.125rem;
        }

        .toolkit-department-count {
          background: #6c757d;
          color: white;
          padding: 0.125rem 0.625rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .toolkit-wholeSchool .toolkit-department-count { background: #6f42c1; }
        .toolkit-elementary .toolkit-department-count { background: #28a745; }
        .toolkit-middleSchool .toolkit-department-count { background: #dc3545; }
        .toolkit-highSchool .toolkit-department-count { background: #007bff; }

        .toolkit-department-apps {
          display: grid;
          gap: 0.75rem;
        }

        .toolkit-loading,
        .toolkit-error {
          text-align: center;
          padding: 3rem 1.5rem;
        }

        .toolkit-loading h3,
        .toolkit-error h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .toolkit-loading h3 {
          color: #192f59;
        }

        .toolkit-error h3 {
          color: #dc3545;
        }

        .toolkit-loading p,
        .toolkit-error p {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .toolkit-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 1rem;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #192f59;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .toolkit-empty {
          color: #6c757d;
          text-align: center;
          padding: 1.5rem;
        }

        .toolkit-compact {
          margin: 1rem 0;
        }

        .toolkit-compact .toolkit-header {
          padding: 1rem;
        }

        .toolkit-compact .toolkit-header h1 {
          font-size: 1.25rem;
        }

        .toolkit-compact .toolkit-content {
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .toolkit-apps-grid,
          .toolkit-departments-grid {
            grid-template-columns: 1fr;
          }

          .toolkit-tab {
            min-width: 140px;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardWidget;
