// DOM Elements
const urlInput = document.getElementById('urlInput');
const generateBtn = document.getElementById('generateBtn');
const resultsContainer = document.getElementById('resultsContainer');
const urlCount = document.getElementById('urlCount');
const welcomeMessage = document.getElementById('welcomeMessage');
const toast = document.getElementById('toast');

// State
let resultCounter = 0;

// Local Storage Keys
const STORAGE_KEY = 'linkgen_results';
const COUNTER_KEY = 'linkgen_counter';

// Event Listeners
generateBtn.addEventListener('click', generateUrls);
urlInput.addEventListener('input', handleInputChange);
urlInput.addEventListener('keypress', handleKeyPress);

// Handle input changes
function handleInputChange() {
    const urls = getUrlsFromInput();
    const count = urls.length;
    
    urlCount.textContent = count;
    generateBtn.disabled = count === 0;
    
    // Auto-resize textarea
    autoResizeTextarea();
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (getUrlsFromInput().length > 0) {
            generateUrls();
        }
    }
}

// Get URLs from input (split by new lines)
function getUrlsFromInput() {
    const text = urlInput.value.trim();
    if (!text) return [];
    
    return text
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .slice(0, 10); // Limit to 10 URLs
}

// Validate URL format
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Add parameters to URL
function addParameterToUrl(url, parameter, value) {
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set(parameter, value);
        return urlObj.toString();
    } catch (error) {
        console.error('Error adding parameter to URL:', error);
        return null;
    }
}

// Save results to localStorage
function saveToLocalStorage() {
    try {
        const results = Array.from(document.querySelectorAll('.result-set')).map(resultSet => {
            const timestamp = resultSet.querySelector('.timestamp').textContent;
            const metaGroup = resultSet.querySelector('[id^="meta-group-"]');
            const googleGroup = resultSet.querySelector('[id^="google-group-"]');
            
            const metaUrls = Array.from(metaGroup.querySelectorAll('.url-item')).map(item => 
                item.textContent.replace(/^\d+\.\s/, '')
            );
            const googleUrls = Array.from(googleGroup.querySelectorAll('.url-item')).map(item => 
                item.textContent.replace(/^\d+\.\s/, '')
            );
            
            return {
                timestamp,
                metaUrls,
                googleUrls,
                resultId: resultSet.id
            };
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        localStorage.setItem(COUNTER_KEY, resultCounter.toString());
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

// Load results from localStorage
function loadFromLocalStorage() {
    try {
        const savedResults = localStorage.getItem(STORAGE_KEY);
        const savedCounter = localStorage.getItem(COUNTER_KEY);
        
        if (savedResults && savedCounter) {
            resultCounter = parseInt(savedCounter, 10) || 0;
            const results = JSON.parse(savedResults);
            
            if (results.length > 0) {
                // Hide welcome message if we have saved results
                welcomeMessage.style.display = 'none';
                
                // Restore each result set
                results.forEach((result, index) => {
                    const setId = index + 1;
                    const resultSetHTML = `
                        <div class="result-set" id="result-set-${setId}">
                            <div class="message-wrapper">
                                <div class="message assistant-message">
                                    <div class="message-avatar">
                                        <i class="fas fa-robot"></i>
                                    </div>
                                    <div class="message-content">
                                        <div class="result-header">
                                            <h3><i class="fas fa-link"></i> Generated ${result.metaUrls.length} tracking URL(s)</h3>
                                            <span class="timestamp">${result.timestamp}</span>
                                        </div>
                                        <div class="url-results">
                                            ${createCompactUrlGroupHTML('Meta Ads URLs', 'facebook', result.metaUrls, `meta-group-${setId}`)}
                                            ${createCompactUrlGroupHTML('Google Ads URLs', 'google', result.googleUrls, `google-group-${setId}`)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    resultsContainer.insertAdjacentHTML('beforeend', resultSetHTML);
                });
                
                showToast(`Restored ${results.length} previous result(s)`, 'success');
            }
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COUNTER_KEY);
    }
}

// Generate URLs with tracking parameters
async function generateUrls() {
    const urls = getUrlsFromInput();
    
    if (urls.length === 0) {
        showToast('Please enter at least one URL', 'error');
        return;
    }
    
    // Validate URLs
    const invalidUrls = urls.filter(url => !isValidUrl(url));
    if (invalidUrls.length > 0) {
        showToast(`Invalid URL(s) found: ${invalidUrls.length}`, 'error');
        return;
    }
    
    // Show loading state
    generateBtn.innerHTML = '<div class="loading"></div>';
    generateBtn.disabled = true;
    
    // Hide welcome message after first generation
    if (resultCounter === 0 && resultsContainer.children.length === 0) {
        welcomeMessage.style.display = 'none';
    }
    
    try {
        // Process URLs
        const results = urls.map(url => {
            const metaUrl = addParameterToUrl(url, 'lead_source', 'meta-ads');
            const googleUrl = addParameterToUrl(url, 'lead_source', 'google-ads');
            
            return {
                original: url,
                meta: metaUrl,
                google: googleUrl,
                success: metaUrl && googleUrl
            };
        });
        
        // Check if all URLs were processed successfully
        const failedResults = results.filter(r => !r.success);
        if (failedResults.length > 0) {
            showToast(`Failed to process ${failedResults.length} URL(s)`, 'error');
        }
        
        const successfulResults = results.filter(r => r.success);
        if (successfulResults.length > 0) {
            // Create result set
            createResultSet(successfulResults);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Clear input
            urlInput.value = '';
            urlCount.textContent = '0';
            
            // Show success message
            showToast(`Generated tracking URLs for ${successfulResults.length} link(s)!`, 'success');
        }
        
    } catch (error) {
        console.error('Error generating URLs:', error);
        showToast('An error occurred while generating URLs', 'error');
    }
    
    // Reset button state
    generateBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    generateBtn.disabled = true;
}

// Create a new result set
function createResultSet(results) {
    resultCounter++;
    
    const resultSetId = `result-set-${resultCounter}`;
    const timestamp = new Date().toLocaleTimeString();
    
    // Group URLs by type
    const metaUrls = results.map(r => r.meta);
    const googleUrls = results.map(r => r.google);
    
    const resultSetHTML = `
        <div class="result-set" id="${resultSetId}">
            <div class="message-wrapper">
                <div class="message assistant-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="result-header">
                            <h3><i class="fas fa-link"></i> Generated ${results.length} tracking URL(s)</h3>
                            <span class="timestamp">${timestamp}</span>
                        </div>
                        <div class="url-results">
                            ${createCompactUrlGroupHTML('Meta Ads URLs', 'facebook', metaUrls, `meta-group-${resultCounter}`)}
                            ${createCompactUrlGroupHTML('Google Ads URLs', 'google', googleUrls, `google-group-${resultCounter}`)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert at the bottom of results container
    resultsContainer.insertAdjacentHTML('beforeend', resultSetHTML);
    
    // Scroll to the new result
    document.getElementById(resultSetId).scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
    });
}

// Create HTML for grouped URLs
function createCompactUrlGroupHTML(title, iconType, urls, groupId) {
    const iconClass = iconType === 'facebook' ? 'fab fa-facebook' : 'fab fa-google';
    const urlList = urls.map((url, index) => `<div class="url-item">${index + 1}. ${url}</div>`).join('');
    
    return `
        <div class="url-group">
            <div class="url-group-header">
                <div class="url-label">
                    <i class="${iconClass}"></i>
                    ${title} (${urls.length})
                </div>
                <button class="copy-all-btn" onclick="copyAllUrls('${groupId}')">
                    <i class="fas fa-copy"></i>
                    Copy All
                </button>
            </div>
            <div class="url-list" id="${groupId}">
                ${urlList}
            </div>
        </div>
    `;
}

// Copy all URLs in a group
function copyAllUrls(groupId) {
    const urlList = document.getElementById(groupId);
    const copyBtn = urlList.parentElement.querySelector('.copy-all-btn');
    const urls = Array.from(urlList.querySelectorAll('.url-item')).map(item => {
        return item.textContent.replace(/^\d+\.\s/, ''); // Remove the number prefix
    });
    
    const allUrls = urls.join('\n');
    
    copyToClipboardText(allUrls, copyBtn);
}

// Copy text to clipboard (updated function)
async function copyToClipboardText(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');
        
        // Show toast
        const urlCount = text.split('\n').length;
        showToast(`${urlCount} URL(s) copied to clipboard!`, 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const urlCount = text.split('\n').length;
        showToast(`${urlCount} URL(s) copied to clipboard!`, 'success');
    }
}

// Legacy copy function for individual URLs (if needed)
async function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    const copyBtn = input.parentElement.querySelector('.copy-btn');
    
    try {
        await navigator.clipboard.writeText(input.value);
        
        // Visual feedback
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.classList.add('copied');
        
        // Show toast
        showToast('URL copied to clipboard!', 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
            copyBtn.classList.remove('copied');
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for browsers that don't support clipboard API
        input.select();
        document.execCommand('copy');
        showToast('URL copied to clipboard!', 'success');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastIcon = toast.querySelector('i');
    const toastText = toast.querySelector('span');
    
    // Update content
    toastText.textContent = message;
    
    // Update icon and color based on type
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toast.style.background = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
    } else {
        toastIcon.className = 'fas fa-check-circle';
        toast.style.background = 'linear-gradient(135deg, #333333 0%, #555555 100%)';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Auto-resize textarea
function autoResizeTextarea() {
    urlInput.style.height = 'auto';
    urlInput.style.height = Math.min(urlInput.scrollHeight, 120) + 'px';
}

// Initialize the app
function init() {
    // Focus on input when page loads
    urlInput.focus();
    
    // Set initial button state
    generateBtn.disabled = true;
    
    // Set initial URL count
    urlCount.textContent = '0';
    
    // Load saved results from localStorage
    loadFromLocalStorage();
    
    // Add paste event listener for better UX
    urlInput.addEventListener('paste', (event) => {
        setTimeout(() => {
            handleInputChange();
        }, 10);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + Enter to generate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (getUrlsFromInput().length > 0) {
            generateUrls();
        }
    }
    
    // Escape to clear input
    if (event.key === 'Escape') {
        urlInput.value = '';
        urlInput.focus();
        handleInputChange();
    }
});

// Make functions globally accessible
window.copyToClipboard = copyToClipboard;
window.copyAllUrls = copyAllUrls;

// Add some helpful utilities
window.clearAllResults = function() {
    resultsContainer.innerHTML = '';
    welcomeMessage.style.display = 'block';
    resultCounter = 0;
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUNTER_KEY);
    
    showToast('All results cleared', 'success');
};

// Export results functionality (could be useful)
window.exportResults = function() {
    const results = Array.from(document.querySelectorAll('.url-group')).map(group => {
        const title = group.querySelector('.url-label').textContent;
        const urls = Array.from(group.querySelectorAll('.url-item')).map(item => 
            item.textContent.replace(/^\d+\.\s/, '')
        );
        
        return { title, urls };
    });
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkgen-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Results exported successfully!', 'success');
}; 