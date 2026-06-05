export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSL Cert Monitor Dashboard</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --bg-dark: #090a0f;
            --bg-glass: rgba(17, 19, 31, 0.65);
            --bg-glass-hover: rgba(26, 29, 46, 0.8);
            --border-glass: rgba(255, 255, 255, 0.08);
            
            --color-text-main: #f3f4f6;
            --color-text-muted: #9ca3af;
            
            --ok-color: #10b981;
            --ok-glow: rgba(16, 185, 129, 0.25);
            
            --warn-color: #f59e0b;
            --warn-glow: rgba(245, 158, 11, 0.25);
            
            --crit-color: #ef4444;
            --crit-glow: rgba(239, 68, 68, 0.25);
            
            --expired-color: #d946ef;
            --expired-glow: rgba(217, 70, 239, 0.25);
            
            --error-color: #6b7280;
            --error-glow: rgba(107, 114, 128, 0.25);
            
            --pending-color: #3b82f6;
            --pending-glow: rgba(59, 130, 246, 0.25);
            
            --accent-glow: radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-dark);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.04) 0%, transparent 45%),
                radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.02) 0%, transparent 50%);
            color: var(--color-text-main);
            min-height: 100vh;
            padding: 2rem 1.5rem;
            line-height: 1.5;
            overflow-x: hidden;
        }

        /* Ambient glow header background */
        .ambient-glow {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100vw;
            height: 350px;
            background: var(--accent-glow);
            z-index: -1;
            pointer-events: none;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            position: relative;
        }

        /* Header design */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1.5rem;
            border-bottom: 1px solid var(--border-glass);
            padding-bottom: 1.5rem;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .brand-logo {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
            font-size: 1.25rem;
            color: white;
        }

        .brand-title h1 {
            font-size: 1.6rem;
            font-weight: 700;
            background: linear-gradient(to right, #ffffff, #a855f7, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
        }

        .brand-title p {
            font-size: 0.85rem;
            color: var(--color-text-muted);
        }

        /* Top Action Buttons */
        .actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .btn {
            font-family: 'Outfit', sans-serif;
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            color: var(--color-text-main);
            padding: 0.6rem 1.2rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .btn:hover {
            background: var(--bg-glass-hover);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            border: none;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            transform: translateY(-2px);
        }

        .btn-danger {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        }

        .btn-danger:hover {
            background: rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.5);
            color: white;
        }

        /* Stats Section */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
        }

        .stat-card {
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            padding: 1.25rem;
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }

        .stat-card::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: transparent;
        }

        .stat-card.stat-total::after { background: #6366f1; }
        .stat-card.stat-ok::after { background: var(--ok-color); }
        .stat-card.stat-warn::after { background: var(--warn-color); }
        .stat-card.stat-crit::after { background: var(--crit-color); }
        .stat-card.stat-exp::after { background: var(--expired-color); }
        .stat-card.stat-err::after { background: var(--error-color); }

        .stat-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-text-muted);
            font-weight: 500;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
        }

        /* Form styling */
        .form-section {
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            padding: 1.5rem;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        /* Documentation section */
        .docs-section {
            border-left: 4px solid #a855f7;
            transition: all 0.3s ease;
        }

        .docs-header:hover #docs-chevron {
            color: #a855f7;
        }

        .code-container pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
        }

        .form-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .add-form {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .form-group {
            flex: 1;
            min-width: 250px;
            position: relative;
        }

        .form-input {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-glass);
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border-radius: 10px;
            color: white;
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.25);
            background: rgba(0, 0, 0, 0.4);
        }

        .form-group i {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-text-muted);
            font-size: 0.95rem;
        }

        /* Grid of Domains */
        .domains-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 1.5rem;
        }

        .domain-card {
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            animation: fadeIn 0.5s ease-out;
        }

        .domain-card:hover {
            transform: translateY(-5px);
            background: var(--bg-glass-hover);
            border-color: rgba(255, 255, 255, 0.15);
        }

        .domain-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.25rem;
            gap: 1rem;
        }

        .domain-name-wrapper {
            overflow: hidden;
        }

        .domain-name {
            font-size: 1.15rem;
            font-weight: 600;
            letter-spacing: -0.2px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .domain-added {
            font-size: 0.75rem;
            color: var(--color-text-muted);
            margin-top: 0.1rem;
        }

        .delete-btn {
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            padding: 0.4rem;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .delete-btn:hover {
            color: #fca5a5;
            background: rgba(239, 68, 68, 0.15);
        }

        .domain-card-body {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
        }

        .domain-days {
            display: flex;
            flex-direction: column;
        }

        .days-number {
            font-size: 1.8rem;
            font-weight: 800;
            line-height: 1;
        }

        .days-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-top: 0.2rem;
        }

        /* Status Pill */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.8rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* Status Theme Styles */
        .theme-ok {
            color: var(--ok-color);
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            box-shadow: 0 0 15px var(--ok-glow);
        }
        .theme-ok .days-number { color: var(--ok-color); }

        .theme-warning {
            color: var(--warn-color);
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.2);
            box-shadow: 0 0 15px var(--warn-glow);
        }
        .theme-warning .days-number { color: var(--warn-color); }

        .theme-critical {
            color: var(--crit-color);
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            box-shadow: 0 0 15px var(--crit-glow);
        }
        .theme-critical .days-number { color: var(--crit-color); }

        .theme-expired {
            color: var(--expired-color);
            background: rgba(217, 70, 239, 0.08);
            border: 1px solid rgba(217, 70, 239, 0.2);
            box-shadow: 0 0 15px var(--expired-glow);
        }
        .theme-expired .days-number { color: var(--expired-color); }

        .theme-error {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
        }
        .theme-error .days-number { color: var(--error-color); }

        .theme-pending {
            color: var(--pending-color);
            background: rgba(59, 130, 246, 0.08);
            border: 1px solid rgba(59, 130, 246, 0.2);
            box-shadow: 0 0 15px var(--pending-glow);
        }
        .theme-pending .days-number { color: var(--pending-color); }

        .domain-card-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: var(--color-text-muted);
        }

        .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-row.error-msg {
            color: #fca5a5;
            font-style: italic;
            margin-top: 0.25rem;
            word-break: break-all;
        }

        .value-bright {
            color: var(--color-text-main);
            font-weight: 500;
        }

        /* Empty state styling */
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 4rem 2rem;
            background: var(--bg-glass);
            border: 1px dashed rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            color: var(--color-text-muted);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            backdrop-filter: blur(10px);
        }

        .empty-icon {
            font-size: 3rem;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a855f7;
            margin-bottom: 0.5rem;
        }

        /* Notifications toast */
        .toast-container {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            z-index: 1000;
        }

        .toast {
            background: rgba(17, 19, 31, 0.9);
            border: 1px solid var(--border-glass);
            border-left: 4px solid #6366f1;
            padding: 1rem 1.25rem;
            border-radius: 10px;
            color: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 280px;
            max-width: 400px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transition: all 0.3s ease;
        }

        .toast.toast-error { border-left-color: var(--crit-color); }
        .toast.toast-success { border-left-color: var(--ok-color); }
        .toast.toast-info { border-left-color: var(--pending-color); }

        /* Highlight animation for websocket update */
        @keyframes pulseHighlight {
            0% { border-color: rgba(99, 102, 241, 0.2); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
            50% { border-color: rgba(99, 102, 241, 0.8); box-shadow: 0 0 20px 4px rgba(99, 102, 241, 0.2); }
            100% { border-color: var(--border-glass); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
        }

        .updated-flash {
            animation: pulseHighlight 1.5s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .fa-spin-slow {
            animation: spin 2s linear infinite;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
            body { padding: 1rem 1rem; }
            header { flex-direction: column; align-items: flex-start; }
            .actions { width: 100%; justify-content: space-between; }
            .add-form { flex-direction: column; }
            .btn { width: 100%; justify-content: center; }
        }

        /* Login Modal CSS */
        .login-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(9, 10, 15, 0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .login-overlay.active {
            opacity: 1;
            pointer-events: all;
        }
        .login-modal {
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            border-radius: 1.5rem;
            padding: 2.5rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .login-overlay.active .login-modal {
            transform: translateY(0);
        }
        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .login-header i {
            font-size: 3rem;
            color: var(--ok-color);
            margin-bottom: 1rem;
            filter: drop-shadow(0 0 10px var(--ok-glow));
        }
        .login-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="ambient-glow"></div>
    
    <!-- Login Overlay -->
    <div class="login-overlay" id="login-overlay">
        <div class="login-modal">
            <div class="login-header">
                <i class="fa-solid fa-lock"></i>
                <h2>Authentication Required</h2>
                <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Please enter your API Key to access the dashboard</p>
            </div>
            <form id="login-form" class="add-form" style="flex-direction: column;">
                <input type="password" id="api-key-input" placeholder="API Key" required style="width: 100%;">
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
                    <i class="fa-solid fa-right-to-bracket"></i> Login
                </button>
            </form>
        </div>
    </div>

    <div class="container">
        <header>
            <div class="brand">
                <div class="brand-logo">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="brand-title">
                    <h1>SSLive</h1>
                    <p>Real-time TLS certificate monitoring with Bun & MongoDB</p>
                </div>
            </div>
            <div class="actions">
                <button class="btn" id="btn-refresh" onclick="triggerCheckAll()">
                    <i class="fa-solid fa-arrows-rotate" id="refresh-icon"></i> Check All
                </button>
                <button class="btn" onclick="logout()" style="color: var(--crit-color); border-color: rgba(239, 68, 68, 0.3); margin-left: 0.5rem;">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
        </header>

        <!-- Stats Section -->
        <section class="stats-grid">
            <div class="stat-card stat-total">
                <span class="stat-label">Total Domains</span>
                <span class="stat-value" id="stat-total-val">0</span>
            </div>
            <div class="stat-card stat-ok">
                <span class="stat-label">Valid (OK)</span>
                <span class="stat-value" id="stat-ok-val" style="color: var(--ok-color)">0</span>
            </div>
            <div class="stat-card stat-warn">
                <span class="stat-label">Warning</span>
                <span class="stat-value" id="stat-warn-val" style="color: var(--warn-color)">0</span>
            </div>
            <div class="stat-card stat-crit">
                <span class="stat-label">Critical</span>
                <span class="stat-value" id="stat-crit-val" style="color: var(--crit-color)">0</span>
            </div>
            <div class="stat-card stat-exp">
                <span class="stat-label">Expired</span>
                <span class="stat-value" id="stat-exp-val" style="color: var(--expired-color)">0</span>
            </div>
            <div class="stat-card stat-err">
                <span class="stat-label">Error</span>
                <span class="stat-value" id="stat-err-val" style="color: var(--color-text-muted)">0</span>
            </div>
        </section>

        <!-- Domain Add Form -->
        <section class="form-section">
            <h2 class="form-title">
                <i class="fa-solid fa-plus-circle" style="color: #6366f1"></i>
                Add new domain
            </h2>
            <form class="add-form" onsubmit="addDomain(event)">
                <div class="form-group">
                    <i class="fa-solid fa-globe"></i>
                    <input type="text" id="domain-input" class="form-input" placeholder="example.com, sub.domain.net" required autocomplete="off">
                </div>
                <button type="submit" class="btn btn-primary" id="btn-add">
                    <i class="fa-solid fa-plus"></i>
                    Monitor
                </button>
            </form>
        </section>

        <!-- WebSocket Guide Section -->
        <section class="form-section docs-section">
            <div class="docs-header" onclick="toggleDocs()" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                <h2 class="form-title" style="margin-bottom: 0;">
                    <i class="fa-solid fa-plug" style="color: #a855f7"></i>
                    Integration & WebSockets
                </h2>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.9rem;">
                    <span>View documentation</span>
                    <i class="fa-solid fa-chevron-down" id="docs-chevron" style="transition: transform 0.3s ease;"></i>
                </div>
            </div>
            
            <div class="docs-content" id="docs-content" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out;">
                <div style="padding-top: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                        <h3 style="font-size: 1rem; color: #a855f7; margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-question"></i> What are these WebSockets?</h3>
                        <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
                            This service exposes a real-time WebSocket server that broadcasts events to all connected client applications. Whenever an SSL certificate's validation status is added, deleted, or updated, the server emits an immediate notification. This allows you to build reactive dashboards, integrate automated alerting systems, or send instant reports.
                        </p>
                    </div>

                    <div>
                        <h3 style="font-size: 1rem; color: #6366f1; margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-nodes"></i> Emitted Events (JSON Payload)</h3>
                        <div class="code-container" style="background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid var(--border-glass); padding: 1rem; font-family: monospace; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.2rem;">
                            <div>
                                <div style="color: #34d399; font-weight: 600; margin-bottom: 0.25rem;">1. Domain Added (added)</div>
                                <pre style="color: #c084fc; overflow-x: auto;">{
  "type": "added",
  "data": {
    "domain": "ejemplo.com",
    "status": "PENDING",
    "addedAt": "2026-06-05T16:00:00.000Z"
  }
}</pre>
                            </div>
                            <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem;">
                                <div style="color: #f59e0b; font-weight: 600; margin-bottom: 0.25rem;">2. Certificate Updated (updated)</div>
                                <pre style="color: #818cf8; overflow-x: auto;">{
  "type": "updated",
  "data": {
    "domain": "ejemplo.com",
    "status": "OK", // o WARNING, CRITICAL, EXPIRED, ERROR
    "days": 45,
    "expires": "2026-07-20 23:59:59 UTC",
    "lastChecked": "2026-06-05T16:05:00.000Z"
  }
}</pre>
                            </div>
                            <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem;">
                                <div style="color: #ef4444; font-weight: 600; margin-bottom: 0.25rem;">3. Domain Deleted (deleted)</div>
                                <pre style="color: #f87171; overflow-x: auto;">{
  "type": "deleted",
  "domain": "ejemplo.com"
}</pre>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style="font-size: 1rem; color: #a855f7; margin-bottom: 0.5rem;"><i class="fa-solid fa-code"></i> JavaScript Connection Example</h3>
                        <div class="code-container" style="background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid var(--border-glass); padding: 1rem; font-family: monospace; font-size: 0.85rem; overflow-x: auto; color: #e2e8f0; line-height: 1.5;">
                            <pre><span style="color: #60a5fa;">const</span> socket = <span style="color: #60a5fa;">new</span> <span style="color: #fca5a5;">WebSocket</span>(<span style="color: #34d399;">\`ws://\${window.location.host}/ws\`</span>);

socket.onopen = () => console.log(<span style="color: #34d399;">"Conectado a los sockets"</span>);

socket.onmessage = (event) => {
  <span style="color: #60a5fa;">const</span> eventData = JSON.parse(event.data);
  console.log(<span style="color: #34d399;">"Nuevo mensaje:"</span>, eventData);
  
  <span style="color: #60a5fa;">if</span> (eventData.type === <span style="color: #34d399;">"updated"</span>) {
    console.log(<span style="color: #34d399;">\`Dominio \${eventData.data.domain} está \${eventData.data.status}\`</span>);
  }
};</pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Grid containing all domain statuses -->
        <main class="domains-grid" id="domains-container">
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-spinner fa-spin"></i></div>
                <h3>Loading domains...</h3>
                <p>Establishing connection to the server and loading database.</p>
            </div>
        </main>
    </div>

    <!-- Notification Toast Container -->
    <div class="toast-container" id="toast-container"></div>

    <script>
        let domains = [];
        let socket;

        // Toggle documentation section collapse/expand
        function toggleDocs() {
            const content = document.getElementById('docs-content');
            const chevron = document.getElementById('docs-chevron');
            if (content.style.maxHeight === '0px' || !content.style.maxHeight) {
                content.style.maxHeight = content.scrollHeight + 'px';
                chevron.style.transform = 'rotate(180deg)';
                chevron.style.color = '#a855f7';
            } else {
                content.style.maxHeight = '0px';
                chevron.style.transform = 'rotate(0deg)';
                chevron.style.color = '';
            }
        }

        // Fetch initial data
        async function fetchDomains() {
            try {
                const response = await fetch('/api/domains');
                if (response.status === 401) {
                    document.getElementById('login-overlay').classList.add('active');
                    return false;
                }
                domains = await response.json();
                renderDomains();
                updateStats();
                return true;
            } catch (error) {
                showToast("Error loading domains from API", "error");
                document.getElementById('domains-container').innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-icon" style="color: var(--crit-color)"><i class="fa-solid fa-circle-exclamation"></i></div>
                        <h3>Connection error</h3>
                        <p>Could not connect to the server API. Ensure the Bun service is running.</p>
                    </div>
                \`;
            }
        }

        // Add domain
        async function addDomain(e) {
            e.preventDefault();
            const input = document.getElementById('domain-input');
            const domain = input.value.trim();
            if (!domain) return;

            const btnAdd = document.getElementById('btn-add');
            const originalHtml = btnAdd.innerHTML;
            btnAdd.disabled = true;
            btnAdd.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Agregando...';

            try {
                const response = await fetch('/api/domains', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || "Error adding domain");
                }
                
                showToast(\`Monitoring started for \${domain}\`, "success");
                input.value = "";
            } catch (error) {
                showToast(error.message, "error");
            } finally {
                btnAdd.disabled = false;
                btnAdd.innerHTML = originalHtml;
            }
        }

        // Delete domain
        async function deleteDomain(domain) {
            if (!confirm(\`Are you sure you want to stop monitoring \${domain}?\`)) return;

            try {
                const response = await fetch(\`/api/domains/\${encodeURIComponent(domain)}\`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Could not delete domain");
                showToast(\`Dominio \${domain} eliminado\`, "info");
            } catch (error) {
                showToast(error.message, "error");
            }
        }

        // Trigger manual check of all domains
        async function triggerCheckAll() {
            const btn = document.getElementById('btn-refresh');
            const icon = document.getElementById('refresh-icon');
            btn.disabled = true;
            icon.classList.add('fa-spin');
            
            showToast("Certificate verification started...", "info");

            try {
                const response = await fetch('/api/check', { method: 'POST' });
                if (!response.ok) throw new Error("Server error during verification");
                showToast("Manual verification completed", "success");
            } catch (error) {
                showToast(error.message, "error");
            } finally {
                btn.disabled = false;
                icon.classList.remove('fa-spin');
            }
        }

        // Render card lists
        function renderDomains() {
            const container = document.getElementById('domains-container');
            if (domains.length === 0) {
                container.innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
                        <h3>No domains registered</h3>
                        <p>Add a domain in the form above to start monitoring its SSL status.</p>
                    </div>
                \`;
                return;
            }

            container.innerHTML = domains.map(d => {
                const themeClass = getThemeClass(d.status);
                const statusLabel = getStatusLabel(d.status);
                const statusIcon = getStatusIcon(d.status);
                const lastCheckedStr = d.lastChecked ? formatDate(d.lastChecked) : 'Never';
                
                let daysText = d.days !== null ? d.days : '-';
                let expLabel = d.expires ? d.expires : '-';
                
                return \`
                    <div class="domain-card theme-\${themeClass}" id="card-\${escapeSelector(d.domain)}">
                        <div class="domain-card-header">
                            <div class="domain-name-wrapper">
                                <h3 class="domain-name" title="\${d.domain}">\${d.domain}</h3>
                                <div class="domain-added">Added: \${formatDate(d.addedAt)}</div>
                            </div>
                            <button class="delete-btn" onclick="deleteDomain('\${d.domain}')" title="Delete domain">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                        <div class="domain-card-body">
                            <div class="domain-days">
                                <span class="days-number">\${daysText}</span>
                                <span class="days-label">Days remaining</span>
                            </div>
                            <div class="status-badge theme-\&s" style="box-shadow: none;">
                                <i class="\${statusIcon}"></i>
                                <span>\${statusLabel}</span>
                            </div>
                        </div>
                        <div class="domain-card-footer">
                            <div class="footer-row">
                                <span>Expires:</span>
                                <span class="value-bright">\&s</span>
                            </div>
                            <div class="footer-row">
                                <span>Last checked:</span>
                                <span>\${lastCheckedStr}</span>
                            </div>
                            \${d.status === 'ERROR' && d.detail ? \`
                                <div class="footer-row error-msg">
                                    <i class="fa-solid fa-circle-info"></i> \${escapeHtml(d.detail)}
                                </div>
                            \` : ''}
                        </div>
                    </div>
                \`.replace('&s', themeClass)
                  .replace('\&s', expLabel);
            }).join('');
        }

        // Helpers for styling
        function getThemeClass(status) {
            switch(status) {
                case 'OK': return 'ok';
                case 'WARNING': return 'warning';
                case 'CRITICAL': return 'critical';
                case 'EXPIRED': return 'expired';
                case 'ERROR': return 'error';
                case 'PENDING':
                default: return 'pending';
            }
        }

        function getStatusLabel(status) {
            switch(status) {
                case 'OK': return 'Valid';
                case 'WARNING': return 'Warning';
                case 'CRITICAL': return 'Critical';
                case 'EXPIRED': return 'Expired';
                case 'ERROR': return 'Error';
                case 'PENDING':
                default: return 'Pending';
            }
        }

        function getStatusIcon(status) {
            switch(status) {
                case 'OK': return 'fa-solid fa-circle-check';
                case 'WARNING': return 'fa-solid fa-triangle-exclamation';
                case 'CRITICAL': return 'fa-solid fa-radiation';
                case 'EXPIRED': return 'fa-solid fa-circle-xmark';
                case 'ERROR': return 'fa-solid fa-circle-info';
                case 'PENDING':
                default: return 'fa-solid fa-circle-notch fa-spin';
            }
        }

        function formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleString('es-ES', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        function escapeSelector(str) {
            return str.replace(/\\./g, '_').replace(/@/g, '_');
        }

        // Stats calculation
        function updateStats() {
            document.getElementById('stat-total-val').textContent = domains.length;
            document.getElementById('stat-ok-val').textContent = domains.filter(d => d.status === 'OK').length;
            document.getElementById('stat-warn-val').textContent = domains.filter(d => d.status === 'WARNING').length;
            document.getElementById('stat-crit-val').textContent = domains.filter(d => d.status === 'CRITICAL').length;
            document.getElementById('stat-exp-val').textContent = domains.filter(d => d.status === 'EXPIRED').length;
            document.getElementById('stat-err-val').textContent = domains.filter(d => d.status === 'ERROR').length;
        }

        // Toast notifications
        function showToast(message, type = "info") {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = \`toast toast-\${type}\`;
            
            let icon = 'fa-info-circle';
            if (type === 'success') icon = 'fa-check-circle';
            if (type === 'error') icon = 'fa-exclamation-circle';
            
            toast.innerHTML = \`
                <i class="fa-solid \${icon}"></i>
                <div>\${message}</div>
            \`;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        // Connect WebSockets
        function connectWebSocket() {
            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUri = \`\${proto}//\${window.location.host}/ws\`;
            
            console.log("Connecting WebSocket to:", wsUri);
            socket = new WebSocket(wsUri);

            socket.onopen = () => {
                console.log("WebSocket connection established");
            };

            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("WebSocket Received:", message);
                    
                    if (message.type === 'added') {
                        domains.push(message.data);
                        domains.sort((a, b) => a.domain.localeCompare(b.domain));
                        renderDomains();
                        updateStats();
                        showToast(\`Dominio \${message.data.domain} agregado\`, "success");
                    } 
                    else if (message.type === 'deleted') {
                        domains = domains.filter(d => d.domain !== message.domain);
                        renderDomains();
                        updateStats();
                    } 
                    else if (message.type === 'updated') {
                        const index = domains.findIndex(d => d.domain === message.data.domain);
                        if (index !== -1) {
                            domains[index] = message.data;
                            renderDomains();
                            updateStats();
                            
                            // Visual flash effect on update
                            const cardId = 'card-' + escapeSelector(message.data.domain);
                            const card = document.getElementById(cardId);
                            if (card) {
                                card.classList.add('updated-flash');
                                setTimeout(() => card.classList.remove('updated-flash'), 1500);
                            }
                            
                            if (message.data.status === 'CRITICAL' || message.data.status === 'EXPIRED') {
                                showToast(\`¡Alerta de certificado para \${message.data.domain}! Estado: \${message.data.status}\`, "error");
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error processing WebSocket message", err);
                }
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected. Retrying connection in 5 seconds...");
                setTimeout(connectWebSocket, 5000);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        }

        // Auth Handlers
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const key = document.getElementById('api-key-input').value;
            const btn = e.target.querySelector('button');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            btn.disabled = true;

            try {
                const res = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key })
                });
                if (res.ok) {
                    document.getElementById('login-overlay').classList.remove('active');
                    document.getElementById('api-key-input').value = '';
                    const authOk = await fetchDomains();
                    if (authOk) connectWebSocket();
                } else {
                    showToast('Invalid API Key', 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            } finally {
                btn.innerHTML = origHtml;
                btn.disabled = false;
            }
        });

        function logout() {
            document.cookie = 'api_key=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            location.reload();
        }

        // Init
        fetchDomains().then(authenticated => {
            if (authenticated) connectWebSocket();
        });
    </script>
</body>
</html>
`;
}
