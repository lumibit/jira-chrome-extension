// Content script for JIRA Workflow Blocker
let inProgressBlockingEnabled = true;
let currentStatus = null;

console.log('🚀 JIRA Transition Blocker content script STARTING...');

// Get initial state from storage
chrome.storage.local.get(['inProgressBlockingEnabled'], function (result) {
    if (result.inProgressBlockingEnabled !== undefined) {
        inProgressBlockingEnabled = result.inProgressBlockingEnabled;
    }
    console.log('📊 Initial InProgress blocking state:', inProgressBlockingEnabled);
    updateRulesBasedOnStatus();
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && changes.inProgressBlockingEnabled) {
        inProgressBlockingEnabled = changes.inProgressBlockingEnabled.newValue;
        console.log('🔄 InProgress blocking toggled:', inProgressBlockingEnabled ? 'ON' : 'OFF');
        updateRulesBasedOnStatus();
    }
});

// Function to get ticket status
function getTicketStatus() {
    const xpath = '//*[@id="opsbar-transitions_more"]/span';
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const element = result.singleNodeValue;
    const status = element ? element.textContent.trim() : null;
    console.log('🔍 XPath result:', status);
    return status;
}

// Function to update rules based on current status
function updateRulesBasedOnStatus() {
    console.log('⚙️ updateRulesBasedOnStatus called - inProgressBlockingEnabled:', inProgressBlockingEnabled);

    if (!inProgressBlockingEnabled) {
        // If toggle is off, disable the ruleset
        console.log('❌ Toggle is OFF - disabling ruleset_2');
        chrome.runtime.sendMessage({
            action: 'updateInProgressRules',
            enabled: false
        }, function (response) {
            console.log('📨 Response from background script (disable):', response);
        });
        return;
    }

    const ticketStatus = getTicketStatus();
    console.log('📋 Current ticket status:', ticketStatus, 'Previous status:', currentStatus);

    if (ticketStatus !== currentStatus) {
        currentStatus = ticketStatus;

        // Only enable rules if status is "New" or "In Specification"
        const shouldBlock = (ticketStatus === 'New' || ticketStatus === 'In Specification');

        console.log('🔄 Status changed - shouldBlock:', shouldBlock, 'for status:', ticketStatus);

        chrome.runtime.sendMessage({
            action: 'updateInProgressRules',
            enabled: shouldBlock
        }, function (response) {
            console.log('📨 Response from background script (update):', response);
        });

        console.log('✅ Rules updated - Status:', ticketStatus, 'Blocking:', shouldBlock);
    } else {
        console.log('⏭️ Status unchanged, no action needed');
    }
}

// Monitor for status changes
function startStatusMonitoring() {
    console.log('👀 Starting status monitoring');

    // Check status every 2 seconds
    setInterval(function () {
        console.log('⏰ Interval check - calling updateRulesBasedOnStatus');
        updateRulesBasedOnStatus();
    }, 2000);

    // Also check when page content changes
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                console.log('🔄 DOM changed - calling updateRulesBasedOnStatus');
                updateRulesBasedOnStatus();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start monitoring when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startStatusMonitoring);
} else {
    startStatusMonitoring();
}

console.log('✅ JIRA Transition Blocker content script loaded and ready!');
