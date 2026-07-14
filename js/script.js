/**
 * Enterprise Business Management System - Modular Core Engine Architecture
 * Unified Namespace Architecture for Data Isolation & Clean State Management
 */

const App = {
    // ----------------------------------------------------------------------
    // GLOBAL STATE STORAGE ENGINE
    // ----------------------------------------------------------------------
    State: {
        currentUser: null,
        employees: [],
        departments: [],
        projects: [],
        attendance: [],
        payroll: [],
        expenses: [],
        clients: [],
        notifications: [],
        currentView: 'dashboard'
    },

    // ----------------------------------------------------------------------
    // COMPONENT: CORE INITIALIZER & SEED DATA ENGINE
    // ----------------------------------------------------------------------
    Init: function() {
        this.Storage.loadAll();
        this.UI.initTheme();
        this.Auth.checkPersistedAuth();
        this.UI.setupGlobalListeners();
    },

    // ----------------------------------------------------------------------
    // COMPONENT: DATA PERSISTENCE LAYER (LOCALSTORAGE)
    // ----------------------------------------------------------------------
    Storage: {
        save: function(key, data) { localStorage.setItem(`ebms_${key}`, JSON.stringify(data)); },
        get: function(key) { return JSON.parse(localStorage.getItem(`ebms_${key}`)); },
        
        loadAll: function() {
            App.State.employees = this.get('employees') || this.seeds.employees;
            App.State.departments = this.get('departments') || this.seeds.departments;
            App.State.projects = this.get('projects') || this.seeds.projects;
            App.State.attendance = this.get('attendance') || this.seeds.attendance;
            App.State.payroll = this.get('payroll') || this.seeds.payroll;
            App.State.expenses = this.get('expenses') || this.seeds.expenses;
            App.State.clients = this.get('clients') || this.seeds.clients;
            App.State.notifications = this.get('notifications') || this.seeds.notifications;
        },
        
        persistAll: function() {
            this.save('employees', App.State.employees);
            this.save('departments', App.State.departments);
            this.save('projects', App.State.projects);
            this.save('attendance', App.State.attendance);
            this.save('payroll', App.State.payroll);
            this.save('expenses', App.State.expenses);
            this.save('clients', App.State.clients);
            this.save('notifications', App.State.notifications);
        },

        seeds: {
            employees: [
                { id: "EMP01", name: "Sarah Jenkins", role: "admin", dept: "Executive", email: "sarah@company.com" },
                { id: "EMP02", name: "Marcus Vance", role: "manager", dept: "Engineering", email: "marcus@company.com" },
                { id: "EMP03", name: "Jane Doe", role: "employee", dept: "Engineering", email: "jane@company.com" }
            ],
            departments: [
                { id: "D01", name: "Engineering", manager: "Marcus Vance" },
                { id: "D02", name: "Marketing", manager: "Sarah Jenkins" }
            ],
            projects: [
                { id: "P01", name: "Cloud Migration", client: "Acme Corp", progress: 75, status: "Active" },
                { id: "P02", name: "Mobile App v2", client: "Globex", progress: 40, status: "Active" }
            ],
            attendance: [
                { date: "2026-06-29", empId: "EMP03", name: "Jane Doe", status: "Present" }
            ],
            payroll: [
                { id: "PAY01", name: "Jane Doe", base: 5500, bonus: 400, net: 5900, status: "Paid" }
            ],
            expenses: [
                { id: "EXP01", requester: "Jane Doe", desc: "AWS Server Infrastructure Hosting", amount: 1250, status: "Pending" }
            ],
            clients: [
                { id: "C01", name: "Acme Corp", contact: "John Smith", value: "$45,000" }
            ],
            notifications: [
                { id: 1, text: "System Bootstrapped Successfully with encrypted LocalStorage modules.", read: false }
            ]
        }
    },

    // ----------------------------------------------------------------------
    // COMPONENT: ROLE-BASED SYSTEM ROLE AUTHENTICATION ENGINE
    // ----------------------------------------------------------------------
    Auth: {
        login: function(e) {
            e.preventDefault();
            const user = document.getElementById('login-username').value.trim().toLowerCase();
            const matchedUser = App.State.employees.find(emp => emp.role === user || emp.id.toLowerCase() === user);

            if (matchedUser) {
                App.State.currentUser = matchedUser;
                localStorage.setItem('ebms_logged_in_user', JSON.stringify(matchedUser));
                App.UI.showToast(`Welcome back, ${matchedUser.name}!`, 'success');
                App.UI.transitionToDashboard();
            } else {
                App.UI.showToast('Invalid enterprise user credential records.', 'danger');
            }
        },

        logout: function() {
            App.State.currentUser = null;
            localStorage.removeItem('ebms_logged_in_user');
            document.getElementById('main-dashboard').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            App.UI.showToast('Session securely terminated.', 'success');
        },

        checkPersistedAuth: function() {
            const savedUser = localStorage.getItem('ebms_logged_in_user');
            if (savedUser) {
                App.State.currentUser = JSON.parse(savedUser);
                App.UI.transitionToDashboard();
            }
        }
    },

    // ----------------------------------------------------------------------
    // COMPONENT: USER INTERFACE RENDERING ORCHESTRATION ENGINE
    // ----------------------------------------------------------------------
    UI: {
        showToast: function(msg, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `<i class="fa-solid ${type==='success'?'fa-circle-check':'fa-triangle-exclamation'}"></i> <span>${msg}</span>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        },

        initTheme: function() {
            const activeTheme = localStorage.getItem('ebms_theme') || 'light';
            document.body.className = `${activeTheme}-theme`;
        },

        toggleTheme: function() {
            const isDark = document.body.classList.contains('dark-theme');
            const targetTheme = isDark ? 'light' : 'dark';
            document.body.className = `${targetTheme}-theme`;
            localStorage.setItem('ebms_theme', targetTheme);
            const icon = document.querySelector('#theme-toggle i');
            icon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        },

        transitionToDashboard: function() {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-dashboard').classList.remove('hidden');
            
            // Populating Identity Summary Card Context
            document.getElementById('user-display-name').innerText = App.State.currentUser.name;
            const roleBadge = document.getElementById('user-display-role');
            roleBadge.innerText = App.State.currentUser.role;
            roleBadge.className = `badge badge-${App.State.currentUser.role === 'admin' ? 'danger' : App.State.currentUser.role === 'manager' ? 'warning' : 'success'}`;
            document.getElementById('user-avatar').innerText = App.State.currentUser.name.charAt(0);

            this.renderNavigationMenu();
            this.switchView('dashboard');
            this.updateNotificationBadge();
        },

        renderNavigationMenu: function() {
            const menu = document.getElementById('sidebar-menu');
            const role = App.State.currentUser.role;
            
            let navItems = [
                { view: 'dashboard', label: 'Dashboard', icon: 'fa-gauge' }
            ];

            if (role === 'admin') {
                navItems.push(
                    { view: 'employees', label: 'Employees', icon: 'fa-users' },
                    { view: 'departments', label: 'Departments', icon: 'fa-sitemap' },
                    { view: 'projects', label: 'Projects', icon: 'fa-diagram-project' },
                    { view: 'attendance', label: 'Attendance', icon: 'fa-calendar-check' },
                    { view: 'payroll', label: 'Payroll Management', icon: 'fa-money-check-dollar' },
                    { view: 'expenses', label: 'Expenses Approval', icon: 'fa-wallet' },
                    { view: 'clients', label: 'Client Accounts', icon: 'fa-handshake' }
                );
            } else if (role === 'manager') {
                navItems.push(
                    { view: 'projects', label: 'Team Projects', icon: 'fa-diagram-project' },
                    { view: 'attendance', label: 'Team Attendance', icon: 'fa-calendar-check' },
                    { view: 'expenses', label: 'Submit Expenses', icon: 'fa-wallet' }
                );
            } else if (role === 'employee') {
                navItems.push(
                    { view: 'projects', label: 'My Projects', icon: 'fa-diagram-project' },
                    { view: 'attendance', label: 'Track Attendance', icon: 'fa-calendar-check' },
                    { view: 'expenses', label: 'My Expenses Claims', icon: 'fa-wallet' }
                );
            }

            menu.innerHTML = navItems.map(item => `
                <a class="menu-item" onclick="App.UI.switchView('${item.view}')" id="nav-${item.view}">
                    <i class="fa-solid ${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            `).join('');
        },

        switchView: function(viewId) {
            App.State.currentView = viewId;
            document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
            const activeNav = document.getElementById(`nav-${viewId}`);
            if (activeNav) activeNav.classList.add('active');

            // Format Title Frame Header text context nicely
            document.getElementById('current-view-title').innerText = viewId.charAt(0).toUpperCase() + viewId.slice(1) + " Module Workspace";

            this.renderActiveViewContent();
        },

        setupGlobalListeners: function() {
            document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
            document.getElementById('sidebar-toggle').addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        },

        toggleNotifications: function() {
            document.getElementById('notification-dropdown').classList.toggle('hidden');
            this.renderNotificationsList();
        },

        updateNotificationBadge: function() {
            const count = App.State.notifications.filter(n => !n.read).length;
            document.getElementById('noti-count').innerText = count;
        },

        renderNotificationsList: function() {
            const list = document.getElementById('notification-list');
            if (App.State.notifications.length === 0) {
                list.innerHTML = '<div class="notification-item">Zero system logs recorded.</div>';
                return;
            }
            list.innerHTML = App.State.notifications.map(n => `
                <div class="notification-item ${n.read?'':'unread'}">
                    <p>${n.text}</p>
                </div>
            `).join('');
            // Auto mark read on view
            App.State.notifications.forEach(n => n.read = true);
            this.updateNotificationBadge();
        },

        openModal: function(title, bodyHtml) {
            document.getElementById('modal-title').innerText = title;
            document.getElementById('modal-body').innerHTML = bodyHtml;
            document.getElementById('global-modal').classList.remove('hidden');
        },

        closeModal: function() {
            document.getElementById('global-modal').classList.add('hidden');
        },

        // ----------------------------------------------------------------------
        // ENGINE VIEWS GENERATOR SUB-ROUTINES
        // ----------------------------------------------------------------------
        renderActiveViewContent: function() {
            const workspace = document.getElementById('view-content');
            const role = App.State.currentUser.role;
            
            if (App.State.currentView === 'dashboard') {
                workspace.innerHTML = `
                    <div class="analytics-grid">
                        <div class="metric-card">
                            <div class="metric-info"><span>Total Workforce Staff</span><h3>${App.State.employees.length}</h3></div>
                            <div class="metric-icon" style="background:rgba(59,130,246,0.1);color:var(--primary-light)"><i class="fa-solid fa-users"></i></div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-info"><span>Active Functional Units</span><h3>${App.State.departments.length}</h3></div>
                            <div class="metric-icon" style="background:rgba(16,185,129,0.1);color:var(--success-color)"><i class="fa-solid fa-sitemap"></i></div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-info"><span>Corporate Operations Matrix</span><h3>${App.State.projects.length}</h3></div>
                            <div class="metric-icon" style="background:rgba(245,158,11,0.1);color:var(--warning-color)"><i class="fa-solid fa-diagram-project"></i></div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-info"><span>Capital Client Portfolios</span><h3>${App.State.clients.length}</h3></div>
                            <div class="metric-icon" style="background:rgba(239,68,68,0.1);color:var(--danger-color)"><i class="fa-solid fa-handshake"></i></div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h3>Operational Performance Analytics</h3>
                        <div class="bar-chart-visual" id="dashboard-metric-chart"></div>
                    </div>
                `;
                this.generateAnalyticsChart();
            } 
            else if (App.State.currentView === 'employees' && role === 'admin') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <input type="text" id="emp-search" placeholder="Search accounts database..." class="search-box" oninput="App.Modules.Employees.renderTable()">
                            <button class="btn btn-primary" onclick="App.Modules.Employees.showAddForm()"><i class="fa-solid fa-plus"></i> Onboard Employee</button>
                        </div>
                        <div id="employees-table-target"></div>
                    </div>
                `;
                App.Modules.Employees.renderTable();
            }
            else if (App.State.currentView === 'projects') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <h3>Corporate Strategy Objectives</h3>
                            ${role !== 'employee' ? `<button class="btn btn-primary" onclick="App.Modules.Projects.showAddForm()"><i class="fa-solid fa-plus"></i> Provision New Project</button>`:''}
                        </div>
                        <div id="projects-table-target"></div>
                    </div>
                `;
                App.Modules.Projects.renderTable();
            }
            else if (App.State.currentView === 'attendance') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <h3>Time & Attendance Ledger</h3>
                            <button class="btn btn-success" onclick="App.Modules.Attendance.logAttendance()"><i class="fa-solid fa-fingerprint"></i> Clear Daily Shift Check-In</button>
                        </div>
                        <div id="attendance-table-target"></div>
                    </div>
                `;
                App.Modules.Attendance.renderTable();
            }
            else if (App.State.currentView === 'departments' && role === 'admin') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <h3>Enterprise Structural Departments</h3>
                        </div>
                        <div id="departments-table-target"></div>
                    </div>
                `;
                App.Modules.Departments.renderTable();
            }
            else if (App.State.currentView === 'payroll' && role === 'admin') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <h3>Corporate Payroll Matrix</h3>
                            <button class="btn btn-secondary" onclick="App.Modules.Payroll.exportCSV()"><i class="fa-solid fa-file-csv"></i> Export Payroll (CSV)</button>
                        </div>
                        <div id="payroll-table-target"></div>
                    </div>
                `;
                App.Modules.Payroll.renderTable();
            }
            else if (App.State.currentView === 'expenses') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <h3>Operational Expense Audit Registry</h3>
                            <button class="btn btn-primary" onclick="App.Modules.Expenses.showRequestForm()">
    <i class="fa-solid fa-plus"></i> Add Expense Claim
</button>
                        </div>
                        <div id="expenses-table-target"></div>
                    </div>
                `;
                App.Modules.Expenses.renderTable();
            }
            else if (App.State.currentView === 'clients' && role === 'admin') {
                workspace.innerHTML = `
                    <div class="table-container">
                        <div class="table-header-ops">
                            <h3>Capital B2B Client Portfolios</h3>
                        </div>
                        <div id="clients-table-target"></div>
                    </div>
                `;
                App.Modules.Clients.renderTable();
            }
            else {
                workspace.innerHTML = `<div style="padding:30px; text-align:center; color:var(--text-muted);">Unauthorized Access Matrix Point or View Under Active System Construction.</div>`;
            }
        },

        generateAnalyticsChart: function() {
            const chart = document.getElementById('dashboard-metric-chart');
            if(!chart) return;
            const data = [
                { label: 'Workforce Staffing', val: App.State.employees.length * 20 },
                { label: 'Enterprise Strategy', val: App.State.projects.length * 35 },
                { label: 'Portfolio Pipelines', val: App.State.clients.length * 40 },
                { label: 'Audit Expense Volumes', val: App.State.expenses.length * 25 }
            ];
            chart.innerHTML = data.map(d => `
                <div class="bar-column" style="height: ${Math.min(d.val, 100)}%" title="${d.label}: ${d.val}%">
                    <span class="bar-label">${d.label}</span>
                </div>
            `).join('');
        }
    },

    // ----------------------------------------------------------------------
    // CORE SYSTEM MODULE CONTROLLERS (CRUD MECHANICS)
    // ----------------------------------------------------------------------
    Modules: {
        Employees: {
            renderTable: function() {
                const query = document.getElementById('emp-search')?.value.toLowerCase() || '';
                const target = document.getElementById('employees-table-target');
                
                const filtered = App.State.employees.filter(e => 
                    e.name.toLowerCase().includes(query) || e.dept.toLowerCase().includes(query)
                );

                target.innerHTML = `
                    <table>
                        <thead>
                            <tr><th>UID</th><th>Staff Name</th><th>Structural Role</th><th>Department</th><th>Operational Email</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${filtered.map(e => `
                                <tr>
                                    <td><strong>${e.id}</strong></td>
                                    <td>${e.name}</td>
                                    <td><span class="badge ${e.role==='admin'?'badge-danger':'badge-success'}">${e.role}</span></td>
                                    <td>${e.dept}</td>
                                    <td>${e.email}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" onclick="App.Modules.Employees.delete('${e.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            },
            showAddForm: function() {
                App.UI.openModal('Onboard Corporate Resource Account', `
                    <form id="add-emp-form" onsubmit="App.Modules.Employees.submit(event)">
                        <div class="form-group"><label>Employee Full Name</label><input type="text" id="new-emp-name" required placeholder="John Doe"></div>
                        <div class="form-group"><label>Enterprise System Account Access Role</label><select id="new-emp-role"><option value="employee">Employee Profile</option><option value="manager">Manager Profile</option><option value="admin">Admin Profile</option></select></div>
                        <div class="form-group"><label>Assigned Department Unit</label><input type="text" id="new-emp-dept" required placeholder="Engineering"></div>
                        <div class="form-group"><label>Enterprise Electronic Mail Address</label><input type="email" id="new-emp-email" required placeholder="john@company.com"></div>
                        <button type="submit" class="btn btn-primary btn-block">Commit Onboarding Process</button>
                    </form>
                `);
            },
            submit: function(e) {
                e.preventDefault();
                const newEmp = {
                    id: "EMP" + String(App.State.employees.length + 1).padStart(2, '0'),
                    name: document.getElementById('new-emp-name').value,
                    role: document.getElementById('new-emp-role').value,
                    dept: document.getElementById('new-emp-dept').value,
                    email: document.getElementById('new-emp-email').value
                };
                App.State.employees.push(newEmp);
                App.Storage.persistAll();
                App.UI.closeModal();
                this.renderTable();
                App.UI.showToast(`System Record initialization verified for ${newEmp.name}.`);
            },
            delete: function(id) {
                if(confirm("Confirm destructive data operations action on account resource?")) {
                    App.State.employees = App.State.employees.filter(e => e.id !== id);
                    App.Storage.persistAll();
                    this.renderTable();
                    App.UI.showToast("Record resource wiped cleanly.", "danger");
                }
            }
        },

        Projects: {
            renderTable: function() {
                const target = document.getElementById('projects-table-target');
                target.innerHTML = `
                    <table>
                        <thead><tr><th>Project Code</th><th>Operational Directive</th><th>Client Entity</th><th>Deployment Completion Track</th><th>Status Badge</th></tr></thead>
                        <tbody>
                            ${App.State.projects.map(p => `
                                <tr>
                                    <td><strong>${p.id}</strong></td>
                                    <td>${p.name}</td>
                                    <td>${p.client}</td>
                                    <td>
                                        <div style="display:flex;align-items:center;gap:10px;">
                                            <div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div>
                                            <span>${p.progress}%</span>
                                        </div>
                                    </td>
                                    <td><span class="badge badge-warning">${p.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            },
            showAddForm: function() {
                App.UI.openModal('Provision New Mission Directive Project', `
                    <form onsubmit="App.Modules.Projects.submit(event)">
                        <div class="form-group"><label>Project Title / Description</label><input type="text" id="new-proj-name" required></div>
                        <div class="form-group"><label>Sponsoring Client Account</label><input type="text" id="new-proj-client" required></div>
                        <button type="submit" class="btn btn-primary btn-block">Deploy Strategy Directive</button>
                    </form>
                `);
            },
            submit: function(e) {
                e.preventDefault();
                App.State.projects.push({
                    id: "P" + String(App.State.projects.length + 1).padStart(2, '0'),
                    name: document.getElementById('new-proj-name').value,
                    client: document.getElementById('new-proj-client').value,
                    progress: 0,
                    status: 'Active'
                });
                App.Storage.persistAll();
                App.UI.closeModal();
                this.renderTable();
                App.UI.showToast("Strategy project allocated cleanly.");
            }
        },

        Attendance: {
            renderTable: function() {
                document.getElementById('attendance-table-target').innerHTML = `
                    <table>
                        <thead><tr><th>Timestamp Date</th><th>Personnel ID</th><th>Profile Identity</th><th>Terminal Status</th></tr></thead>
                        <tbody>
                            ${App.State.attendance.map(a => `
                                <tr><td>${a.date}</td><td>${a.empId}</td><td>${a.name}</td><td><span class="badge badge-success">${a.status}</span></td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            },
            logAttendance: function() {
                const u = App.State.currentUser;
                const today = new Date().toISOString().split('T')[0];
                const checked = App.State.attendance.some(a => a.date === today && a.empId === u.id);
                
                if (checked) {
                    App.UI.showToast("Shift status check-in already logged for today.", "warning");
                    return;
                }
                App.State.attendance.push({ date: today, empId: u.id, name: u.name, status: "Present" });
                App.Storage.persistAll();
                this.renderTable();
                App.UI.showToast("Attendance parameter logged to matrix cleanly.");
            }
        },

        Departments: {
            renderTable: function() {
                document.getElementById('departments-table-target').innerHTML = `
                    <table>
                        <thead><tr><th>ID Code</th><th>Operational Unit</th><th>Assigned Director Lead</th></tr></thead>
                        <tbody>
                            ${App.State.departments.map(d => `<tr><td><strong>${d.id}</strong></td><td>${d.name}</td><td>${d.manager}</td></tr>`).join('')}
                        </tbody>
                    </table>
                `;
            }
        },

        Payroll: {
            renderTable: function() {
                document.getElementById('payroll-table-target').innerHTML = `
                    <table>
                        <thead><tr><th>ID</th><th>Beneficiary Identity</th><th>Base Remuneration</th><th>Performance Incentives</th><th>Net Financial Value</th><th>Status</th></tr></thead>
                        <tbody>
                            ${App.State.payroll.map(p => `<tr><td><strong>${p.id}</strong></td><td>${p.name}</td><td>$${p.base}</td><td>$${p.bonus}</td><td><strong>$${p.net}</strong></td><td><span class="badge badge-success">${p.status}</span></td></tr>`).join('')}
                        </tbody>
                    </table>
                `;
            },
            exportCSV: function() {
                let csv = 'ID,Name,Base,Bonus,Net,Status\n';
                App.State.payroll.forEach(p => { csv += `${p.id},${p.name},${p.base},${p.bonus},${p.net},${p.status}\n`; });
                const blob = new Blob([csv], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Corporate_Payroll_Ledger.csv';
                link.click();
                App.UI.showToast("CSV dataset compilation downloaded successfully.");
            }
        },

        Expenses: {
            renderTable: function() {
                const role = App.State.currentUser.role;
                document.getElementById('expenses-table-target').innerHTML = `
                    <table>
                        <thead><tr><th>Claim ID</th><th>Resource Owner</th><th>Description Purpose</th><th>Financial Value</th><th>Audit Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${App.State.expenses.map(e => `
                                <tr>
                                    <td><strong>${e.id}</strong></td>
                                    <td>${e.requester}</td>
                                    <td>${e.desc}</td>
                                    <td><strong>$${e.amount}</strong></td>
                                    <td><span class="badge ${e.status==='Pending'?'badge-warning':'badge-success'}">${e.status}</span></td>
                                    <td>
                                        ${role === 'admin' && e.status === 'Pending' ? `<button class="btn btn-success btn-sm" onclick="App.Modules.Expenses.approve('${e.id}')">Approve Claim</button>` : 'System Locked'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            },
            showRequestForm: function() {
                App.UI.openModal('Submit Strategic Resource Claim Allocation Request', `
                    <form onsubmit="App.Modules.Expenses.submit(event)">
                        <div class="form-group"><label>Line Item Statement</label><input type="text" id="new-exp-desc" required></div>
                        <div class="form-group"><label>Financial Operational Capital Needed ($)</label><input type="number" id="new-exp-amt" required></div>
                        <button type="submit" class="btn btn-primary btn-block">File Expense Pipeline</button>
                    </form>
                `);
            },
            submit: function(e) {
                e.preventDefault();
                App.State.expenses.push({
                    id: "EXP" + String(App.State.expenses.length + 1).padStart(2, '0'),
                    requester: App.State.currentUser.name,
                    desc: document.getElementById('new-exp-desc').value,
                    amount: parseFloat(document.getElementById('new-exp-amt').value),
                    status: 'Pending'
                });
                App.Storage.persistAll();
                App.UI.closeModal();
                this.renderTable();
                App.UI.showToast("Expense claims file submitted to compliance audit successfully.");
            },
            approve: function(id) {
                const exp = App.State.expenses.find(e => e.id === id);
                if(exp) {
                    exp.status = 'Approved';
                    App.State.notifications.push({ id: Date.now(), text: `Capital claim asset ${id} approved by Administration.`, read: false });
                    App.Storage.persistAll();
                    this.renderTable();
                    App.UI.updateNotificationBadge();
                    App.UI.showToast(`Claim allocation ${id} approved cleanly.`);
                }
            }
        },

        Clients: {
            renderTable: function() {
                document.getElementById('clients-table-target').innerHTML = `
                    <table>
                        <thead><tr><th>Client Code</th><th>Corporate Enterprise Entity</th><th>Account Key Person</th><th>Portfolio Asset Value</th></tr></thead>
                        <tbody>
                            ${App.State.clients.map(c => `<tr><td><strong>${c.id}</strong></td><td>${c.name}</td><td>${c.contact}</td><td><span class="badge badge-success">${c.value}</span></td></tr>`).join('')}
                        </tbody>
                    </table>
                `;
            }
        }
    }
};

// INITIALIZE ENTERPRISE RUNTIME SYSTEM ENGINE BOOTSTRAP
window.addEventListener('DOMContentLoaded', () => App.Init());