// Background service worker for JIRA Workflow Blocker (Manifest V3)
let blockedCount = 0;
let blockingEnabled = true;

// Initialize from storage
chrome.storage.local.get(['blockedCount', 'blockingEnabled'], function (result) {
    if (result.blockedCount) {
        blockedCount = result.blockedCount;
    }
    if (result.blockingEnabled !== undefined) {
        blockingEnabled = result.blockingEnabled;
        updateRules(blockingEnabled);
    }
});

// Function to update declarative rules
function updateRules(enabled) {
    if (enabled) {
        // Enable the ruleset
        chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ['ruleset_1']
        });
        console.log('Blocking rules enabled');
    } else {
        // Disable the ruleset
        chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ['ruleset_1']
        });
        console.log('Blocking rules disabled');
    }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getBlockedCount') {
        sendResponse({ count: blockedCount });
    } else if (request.action === 'toggleBlocking') {
        blockingEnabled = request.enabled;
        updateRules(blockingEnabled);
        sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async response
});

// Log when extension is loaded
console.log('JIRA Transition Blocker loaded (Manifest V3)'); 