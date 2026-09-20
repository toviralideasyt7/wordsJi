/**
 * Ad Blocker Detection Utility
 * Detects when users have ad blockers enabled
 */

export interface AdBlockerStatus {
  detected: boolean;
  userAgent?: string;
  blockedBy?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Check for common ad blocker indicators
 */
export function detectAdBlocker(): AdBlockerStatus {
  const status: AdBlockerStatus = {
    detected: false,
    confidence: 'low'
  };
  
  // Check user agent for known ad blockers
  const userAgent = navigator.userAgent.toLowerCase();
  status.userAgent = userAgent;
  
  const adBlockers = {
    'brave': /brave/i.test(userAgent),
    'ublock-origin': typeof window.ubo !== 'undefined',
    'adblock-plus': typeof window.adblock !== 'undefined',
    'ghostery': /ghostery/i.test(userAgent),
    'privacy-badger': /privacy\s*badger/i.test(userAgent)
  };
  
  const blockers = Object.entries(adBlockers)
    .filter(([, detected]) => detected)
    .map(([name]) => name);
  
  if (blockers.length > 0) {
    status.blockedBy = blockers.join(', ');
    status.confidence = 'medium';
  }
  
  // Check for common ad-related DOM elements that should exist but don't
  const checkAdContainers = () => {
    const selectors = [
      '#adsbox',
      '.adsbygoogle',
      '[class*="mediavine"]',
      '[id*="mediavine"]',
      '.ad-slot',
      '.advertisement'
    ];
    
    let foundBlocked = false;
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const computedStyle = getComputedStyle(el);
        if (
          el.offsetHeight === 0 ||
          computedStyle.display === 'none' ||
          computedStyle.visibility === 'hidden' ||
          computedStyle.height === '0px'
        ) {
          foundBlocked = true;
          break;
        }
      }
    }
    
    if (foundBlocked) {
      status.confidence = 'high';
    }
    
    return foundBlocked;
  };
  
  // Run check after a short delay to allow ads to load
  setTimeout(() => {
    const blocked = checkAdContainers();
    if (blocked && status.confidence === 'low') {
      status.confidence = 'medium';
    }
  }, 2000);
  
  return status;
}

/**
 * Create a test ad container to verify if ads are being blocked
 */
export function createAdTestContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'mv-ad-test-container';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 1px;
    height: 1px;
  `;
  
  // Add a test ad element
  const adDiv = document.createElement('div');
  adDiv.className = 'adsbygoogle';
  adDiv.style.cssText = 'width: 728px; height: 90px;';
  
  container.appendChild(adDiv);
  document.body.appendChild(container);
  
  return container;
}

/**
 * Check if test container was blocked (indicating ad blocker)
 */
export function isAdBlockerActive(): boolean {
  const testContainer = document.getElementById('mv-ad-test-container');
  
  if (!testContainer) {
    // Container doesn't exist yet, create it
    createAdTestContainer();
    return false;
  }
  
  // Check if the container or its children have been removed/hidden
  const adElement = testContainer.querySelector('.adsbygoogle');
  if (!adElement) {
    return true; // Element was removed by ad blocker
  }
  
  const rect = adElement.getBoundingClientRect();
  return rect.width === 0 && rect.height === 0;
}

/**
 * Get ad blocker warning message
 */
export function getAdBlockerMessage(): string {
  return `
    <div class="adblock-warning" role="alert">
      <div class="adblock-content">
        <h2>🛡️ Ad Blocker Detected</h2>
        <p>We rely on advertising to keep WordSolverX free and updated daily.</p>
        <p>Please consider whitelisting our site or disabling your ad blocker.</p>
        
        <div class="adblock-instructions">
          <h3>How to Disable Ad Blocker:</h3>
          <ol>
            <li>Click the ad blocker icon in your browser toolbar</li>
            <li>Select "Pause" or "Disable" for wordsolverx.com</li>
            <li>Refresh the page to see full content</li>
          </ol>
        </div>
        
        <div class="adblock-actions">
          <button onclick="location.reload()" class="btn-whitelist">
            ✅ I've Disabled Ad Blocker
          </button>
          <a href="/contact" class="btn-support">Support Us</a>
        </div>
        
        <p class="adblock-note">
          Don't want to disable? <a href="/premium">Try our premium tier</a> for an ad-free experience.
        </p>
      </div>
    </div>
  `;
}

/**
 * CSS styles for ad blocker warning
 */
export const ADBLOCKER_STYLES = `
  .adblock-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    backdrop-filter: blur(8px);
  }
  
  .adblock-content {
    background: white;
    padding: 40px;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .adblock-content h2 {
    margin-top: 0;
    color: #1a1a2e;
    font-size: 24px;
  }
  
  .adblock-content p {
    color: #4a5568;
    line-height: 1.6;
    margin: 16px 0;
  }
  
  .adblock-instructions {
    text-align: left;
    margin: 24px 0;
    background: #f7fafc;
    padding: 20px;
    border-radius: 12px;
    border-left: 4px solid #48bb78;
  }
  
  .adblock-instructions h3 {
    margin-top: 0;
    color: #2d3748;
    font-size: 16px;
  }
  
  .adblock-instructions ol {
    margin: 12px 0;
    padding-left: 24px;
    color: #4a5568;
  }
  
  .adblock-instructions li {
    margin: 8px 0;
    line-height: 1.5;
  }
  
  .adblock-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
    flex-wrap: wrap;
  }
  
  .btn-whitelist {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(72, 187, 120, 0.3);
  }
  
  .btn-whitelist:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(72, 187, 120, 0.4);
  }
  
  .btn-support {
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    color: white;
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(66, 153, 225, 0.3);
  }
  
  .btn-support:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(66, 153, 225, 0.4);
  }
  
  .adblock-note {
    margin-top: 20px;
    font-size: 14px;
    color: #718096;
  }
  
  .adblock-note a {
    color: #3182ce;
    text-decoration: underline;
  }
  
  .adblock-note a:hover {
    color: #2c5282;
  }
`;