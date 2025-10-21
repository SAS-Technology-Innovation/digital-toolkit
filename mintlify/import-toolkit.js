/**
 * SAS Digital Toolkit - Simple JavaScript Import
 *
 * This file provides a simple way to import the dashboard into any page,
 * including Mintlify MDX files, without requiring React.
 *
 * Usage:
 * 1. Include this script in your HTML/MDX
 * 2. Call initToolkitDashboard() with your Apps Script URL
 *
 * Example:
 * ```html
 * <div id="toolkit-dashboard"></div>
 * <script src="./import-toolkit.js"></script>
 * <script>
 *   initToolkitDashboard({
 *     apiUrl: 'YOUR_APPS_SCRIPT_WEB_APP_URL',
 *     containerId: 'toolkit-dashboard'
 *   });
 * </script>
 * ```
 */

(function (global) {
  'use strict';

  /**
   * Initialize the Digital Toolkit Dashboard
   * @param {Object} options - Configuration options
   * @param {string} options.apiUrl - Google Apps Script web app URL
   * @param {string} options.containerId - ID of container element (default: 'toolkit-dashboard')
   * @param {string} options.defaultDivision - Default tab to show (default: 'wholeSchool')
   * @param {boolean} options.showHeader - Show header (default: true)
   * @param {boolean} options.compact - Use compact mode (default: false)
   */
  function initToolkitDashboard(options = {}) {
    const config = {
      apiUrl: options.apiUrl || '',
      containerId: options.containerId || 'toolkit-dashboard',
      defaultDivision: options.defaultDivision || 'wholeSchool',
      showHeader: options.showHeader !== false,
      compact: options.compact || false
    };

    if (!config.apiUrl) {
      console.error('Toolkit Dashboard: apiUrl is required');
      return;
    }

    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error(`Toolkit Dashboard: Container element #${config.containerId} not found`);
      return;
    }

    // Initialize the dashboard
    const dashboard = new ToolkitDashboard(container, config);
    dashboard.init();
  }

  /**
   * Main Dashboard Class
   */
  class ToolkitDashboard {
    constructor(container, config) {
      this.container = container;
      this.config = config;
      this.data = null;
      this.activeTab = config.defaultDivision;
    }

    async init() {
      this.injectStyles();
      this.renderLoading();
      await this.fetchData();
      this.render();
    }

    async fetchData() {
      try {
        const response = await fetch(`${this.config.apiUrl}?action=getDashboardData`);

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const textData = await response.text();
        this.data = JSON.parse(textData);

        if (this.data.error) {
          throw new Error(this.data.error);
        }
      } catch (error) {
        console.error('Toolkit Dashboard Error:', error);
        this.renderError(error.message);
      }
    }

    renderLoading() {
      this.container.innerHTML = `
        <div class="toolkit-loading">
          <div class="toolkit-spinner"></div>
          <h3>Loading Dashboard...</h3>
          <p>Please wait while we fetch the digital toolkit data...</p>
        </div>
      `;
    }

    renderError(message) {
      this.container.innerHTML = `
        <div class="toolkit-error">
          <h3>⚠️ Error Loading Dashboard</h3>
          <p>${message}</p>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
        </div>
      `;
    }

    render() {
      if (!this.data) return;

      const tabs = [
        { id: 'wholeSchool', name: 'Whole School', icon: '🌍' },
        { id: 'elementary', name: 'Elementary', icon: '👶' },
        { id: 'middleSchool', name: 'Middle School', icon: '🎓' },
        { id: 'highSchool', name: 'High School', icon: '🏫' }
      ];

      this.container.innerHTML = `
        <div class="toolkit-widget ${this.config.compact ? 'toolkit-compact' : ''}">
          ${this.config.showHeader ? `
            <div class="toolkit-header">
              <h1>SAS Digital Toolkit</h1>
            </div>
          ` : ''}

          <div class="toolkit-tabs">
            ${tabs.map(tab => `
              <button
                class="toolkit-tab ${this.activeTab === tab.id ? 'active' : ''}"
                data-tab="${tab.id}"
              >
                <span class="toolkit-tab-icon">${tab.icon}</span>
                ${tab.name}
              </button>
            `).join('')}
          </div>

          <div class="toolkit-content">
            ${tabs.map(tab => `
              <div
                class="toolkit-tab-content ${this.activeTab === tab.id ? 'active' : ''}"
                data-tab-content="${tab.id}"
              >
                ${this.renderDivisionContent(this.data[tab.id], tab.id)}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.attachEventListeners();
    }

    renderDivisionContent(divisionData, division) {
      if (!divisionData) return '<p class="toolkit-empty">No data available</p>';

      const everyoneApps = divisionData.everyoneApps || [];
      const departments = divisionData.byDepartment || {};
      const divisionName = this.getDivisionName(division);

      return `
        <div class="toolkit-division-content toolkit-${division}">
          <div class="toolkit-everyone-section">
            <h2 class="toolkit-section-title">
              <span class="toolkit-icon">👥</span>
              ${division === 'wholeSchool'
                ? 'Apps Everyone Can Use'
                : `Core Apps for ${divisionName}`
              }
            </h2>
            <p class="toolkit-section-subtitle">
              ${division === 'wholeSchool'
                ? 'These core applications are available to the entire SAS community.'
                : `These applications are available to all ${divisionName.toLowerCase()} students and staff.`
              }
            </p>
            <div class="toolkit-apps-grid">
              ${everyoneApps.length > 0
                ? everyoneApps.map(app => this.renderAppCard(app)).join('')
                : '<p class="toolkit-empty">No core apps found for this division.</p>'
              }
            </div>
          </div>

          ${Object.keys(departments).length > 0 ? `
            <div class="toolkit-departments-section">
              <h3 class="toolkit-section-title">
                <span class="toolkit-icon">🏢</span>
                ${division === 'wholeSchool'
                  ? 'Department-Specific Apps'
                  : `${divisionName} Department Apps`
                }
              </h3>
              <div class="toolkit-departments-grid">
                ${Object.entries(departments)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dept, apps]) => this.renderDepartmentCard(dept, apps))
                  .join('')
                }
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderAppCard(app) {
      return `
        <div class="toolkit-app-card">
          <a href="${app.website}" target="_blank" rel="noopener noreferrer" class="toolkit-app-link">
            <h4 class="toolkit-app-name">${app.product}</h4>
          </a>
          <div class="toolkit-app-tags">
            ${app.category ? `<span class="toolkit-tag toolkit-tag-category">${app.category}</span>` : ''}
            ${app.subject ? `<span class="toolkit-tag toolkit-tag-subject">${app.subject}</span>` : ''}
            ${app.licenseType ? `<span class="toolkit-tag toolkit-tag-license">${app.licenseType}</span>` : ''}
          </div>
        </div>
      `;
    }

    renderDepartmentCard(department, apps) {
      const icon = this.getDepartmentIcon(department);

      return `
        <div class="toolkit-department-card">
          <div class="toolkit-department-header">
            <h3 class="toolkit-department-title">
              <span class="toolkit-department-icon">${icon}</span>
              ${department}
            </h3>
            <span class="toolkit-department-count">${apps.length}</span>
          </div>
          <div class="toolkit-department-apps">
            ${apps.map(app => this.renderAppCard(app)).join('')}
          </div>
        </div>
      `;
    }

    attachEventListeners() {
      const tabButtons = this.container.querySelectorAll('.toolkit-tab');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.getAttribute('data-tab');
          this.switchTab(tabId);
        });
      });
    }

    switchTab(tabId) {
      this.activeTab = tabId;

      // Update tab buttons
      const tabButtons = this.container.querySelectorAll('.toolkit-tab');
      tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Update tab content
      const tabContents = this.container.querySelectorAll('.toolkit-tab-content');
      tabContents.forEach(content => {
        if (content.getAttribute('data-tab-content') === tabId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    }

    getDivisionName(division) {
      const names = {
        wholeSchool: 'Whole School',
        elementary: 'Elementary School',
        middleSchool: 'Middle School',
        highSchool: 'High School'
      };
      return names[division] || division;
    }

    getDepartmentIcon(department) {
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
    }

    injectStyles() {
      // Check if styles already injected
      if (document.getElementById('toolkit-dashboard-styles')) return;

      const styleElement = document.createElement('style');
      styleElement.id = 'toolkit-dashboard-styles';
      styleElement.textContent = `
        /* Toolkit Dashboard Styles */
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

        .toolkit-content {
          padding: 1.5rem;
          background: white;
        }

        .toolkit-tab-content {
          display: none;
        }

        .toolkit-tab-content.active {
          display: block;
          animation: toolkitFadeIn 0.3s ease;
        }

        @keyframes toolkitFadeIn {
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
          animation: toolkitSpin 1s linear infinite;
        }

        @keyframes toolkitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .toolkit-empty {
          color: #6c757d;
          text-align: center;
          padding: 1.5rem;
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
      `;

      document.head.appendChild(styleElement);
    }
  }

  // Expose to global scope
  global.initToolkitDashboard = initToolkitDashboard;
  global.ToolkitDashboard = ToolkitDashboard;

})(typeof window !== 'undefined' ? window : global);
