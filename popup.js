// Popup script for JIRA Workflow Blocker (Manifest V3)
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('blockingToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const statusDiv = document.getElementById('status');
    const blockedCountDiv = document.getElementById('blockedCount');
    const ticketStatusDiv = document.getElementById('ticketStatus');
    const inProgressToggle = document.getElementById('inProgressToggle');
    const inProgressToggleLabel = document.getElementById('inProgressToggleLabel');

    // Display version in footer
    if (chrome && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        const version = manifest.version;
        const footer = document.getElementById('footerVersion');
        if (footer && version) {
            footer.textContent = '2025 Lumibit GmbH v' + version;
        }
    }

    // Function to extract ticket status from current tab
    function extractTicketStatus() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('jira')) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: function () {
                        const xpath = '//*[@id="opsbar-transitions_more"]/span';
                        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                        const element = result.singleNodeValue;
                        return element ? element.textContent.trim() : 'Status not found';
                    }
                }, function (results) {
                    if (results && results[0] && results[0].result) {
                        ticketStatusDiv.textContent = results[0].result;
                    } else {
                        ticketStatusDiv.textContent = 'Status not available';
                    }
                });
            } else {
                ticketStatusDiv.textContent = 'Not on JIRA page';
            }
        });
    }

    // Extract ticket status when popup opens
    extractTicketStatus();

    // Load current blocking states
    chrome.storage.local.get(['blockingEnabled', 'inProgressBlockingEnabled'], function (result) {
        const isEnabled = result.blockingEnabled !== false; // Default to true
        const inProgressEnabled = result.inProgressBlockingEnabled !== false; // Default to true
        toggle.checked = isEnabled;
        inProgressToggle.checked = inProgressEnabled;
        updateUI(isEnabled, inProgressEnabled);
    });

    // Handle main toggle change
    toggle.addEventListener('change', function () {
        const isEnabled = toggle.checked;

        // Save state to storage
        chrome.storage.local.set({ blockingEnabled: isEnabled });

        // Update UI
        updateUI(isEnabled, inProgressToggle.checked);

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'toggleBlocking',
            enabled: isEnabled
        });

        console.log('Main blocking toggled:', isEnabled ? 'ON' : 'OFF');
    });

    // Handle InProgress toggle change
    inProgressToggle.addEventListener('change', function () {
        const isEnabled = inProgressToggle.checked;

        // Save state to storage
        chrome.storage.local.set({ inProgressBlockingEnabled: isEnabled });

        // Update UI
        updateUI(toggle.checked, isEnabled);

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'toggleInProgressBlocking',
            enabled: isEnabled
        });

        console.log('InProgress blocking toggled:', isEnabled ? 'ON' : 'OFF');
    });

    function updateUI(isEnabled, inProgressEnabled) {
        if (isEnabled) {
            toggleLabel.textContent = 'Enabled';
        } else {
            toggleLabel.textContent = 'Disabled';
        }

        if (inProgressEnabled) {
            inProgressToggleLabel.textContent = 'Enabled';
        } else {
            inProgressToggleLabel.textContent = 'Disabled';
        }
    }
}); 