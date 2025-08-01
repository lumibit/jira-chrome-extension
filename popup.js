// Popup script for JIRA Workflow Blocker (Manifest V3)
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('blockingToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const statusDiv = document.getElementById('status');
    const blockedCountDiv = document.getElementById('blockedCount');

    // Display version in footer
    if (chrome && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        const version = manifest.version;
        const footer = document.getElementById('footerVersion');
        if (footer && version) {
            footer.textContent = '2025 Lumibit GmbH v' + version;
        }
    }

    // Load current blocking state
    chrome.storage.local.get(['blockingEnabled'], function (result) {
        const isEnabled = result.blockingEnabled !== false; // Default to true
        toggle.checked = isEnabled;
        updateUI(isEnabled);
    });

    // Handle toggle change
    toggle.addEventListener('change', function () {
        const isEnabled = toggle.checked;

        // Save state to storage
        chrome.storage.local.set({ blockingEnabled: isEnabled });

        // Update UI
        updateUI(isEnabled);

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'toggleBlocking',
            enabled: isEnabled
        });

        console.log('Blocking toggled:', isEnabled ? 'ON' : 'OFF');
    });

    function updateUI(isEnabled) {
        if (isEnabled) {
            toggleLabel.textContent = 'Enabled';
            if (statusDiv) {
                statusDiv.className = 'status active';
                statusDiv.innerHTML = '<strong>Extension Active</strong><br><small>Blocking workflow dispatcher requests</small>';
            }
            if (blockedCountDiv) {
                blockedCountDiv.textContent = 'Active';
            }
        } else {
            toggleLabel.textContent = 'Disabled';
            if (statusDiv) {
                statusDiv.className = 'status inactive';
                statusDiv.innerHTML = '<strong>Extension Inactive</strong><br><small>Blocking is disabled</small>';
            }
            if (blockedCountDiv) {
                blockedCountDiv.textContent = 'Disabled';
            }
        }
    }
}); 