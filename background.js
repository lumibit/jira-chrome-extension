// Background service worker for JIRA Workflow Blocker (Manifest V3)
let blockedCount = 0;
let blockingEnabled = true;
let inProgressBlockingEnabled = true;

// Initialize from storage
chrome.storage.local.get(['blockedCount', 'blockingEnabled', 'inProgressBlockingEnabled'], function (result) {
    if (result.blockedCount) {
        blockedCount = result.blockedCount;
    }
    if (result.blockingEnabled !== undefined) {
        blockingEnabled = result.blockingEnabled;
    }
    if (result.inProgressBlockingEnabled !== undefined) {
        inProgressBlockingEnabled = result.inProgressBlockingEnabled;
    }
    console.log('Background script initialized - blockingEnabled:', blockingEnabled, 'inProgressBlockingEnabled:', inProgressBlockingEnabled);
    updateRules(blockingEnabled, inProgressBlockingEnabled);
});

// Function to update declarative rules
function updateRules(mainEnabled, inProgressEnabled) {
    console.log('updateRules called - mainEnabled:', mainEnabled, 'inProgressEnabled:', inProgressEnabled);

    // Manage ruleset_1 (action171)
    if (mainEnabled) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ['ruleset_1']
        });
        console.log('Enabled ruleset_1');
    } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ['ruleset_1']
        });
        console.log('Disabled ruleset_1');
    }

    // Manage ruleset_2 (action161/action221) - only if toggle is enabled
    if (inProgressEnabled) {
        // Don't enable here - let content script control it based on status
        console.log('InProgress toggle enabled - content script will control ruleset_2');
    } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ['ruleset_2']
        });
        console.log('Disabled ruleset_2 (toggle off)');
    }

    console.log('Rules updated - Main:', mainEnabled ? 'ON' : 'OFF', 'InProgress:', inProgressEnabled ? 'ON' : 'OFF');
}

// Handle messages from popup and content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Message received:', request.action, 'from:', sender.tab ? sender.tab.url : 'background');

    if (request.action === 'getBlockedCount') {
        sendResponse({ count: blockedCount });
    } else if (request.action === 'toggleBlocking') {
        blockingEnabled = request.enabled;
        console.log('Toggle blocking changed to:', blockingEnabled);
        updateRules(blockingEnabled, inProgressBlockingEnabled);
        sendResponse({ success: true });
    } else if (request.action === 'toggleInProgressBlocking') {
        inProgressBlockingEnabled = request.enabled;
        console.log('Toggle InProgress blocking changed to:', inProgressBlockingEnabled);
        updateRules(blockingEnabled, inProgressBlockingEnabled);
        sendResponse({ success: true });
    } else if (request.action === 'updateInProgressRules') {
        // Handle dynamic ruleset control from content script
        console.log('Content script requested ruleset_2 update - enabled:', request.enabled);
        if (request.enabled) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ['ruleset_2']
            });
            console.log('InProgress ruleset enabled by content script');
        } else {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ['ruleset_2']
            });
            console.log('InProgress ruleset disabled by content script');
        }
        sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async response
});

// Log when extension is loaded
console.log('JIRA Transition Blocker loaded (Manifest V3)'); 