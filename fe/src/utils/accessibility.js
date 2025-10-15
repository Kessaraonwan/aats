// Accessibility Helper Functions

/**
 * Generate unique ID for form fields
 */
export function generateId(prefix = 'field') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus trap for modals/dialogs
 */
export function createFocusTrap(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1, color2) {
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Keyboard navigation helper
 */
export function handleArrowKeyNavigation(event, items, currentIndex, onSelect) {
  const { key } = event;
  let newIndex = currentIndex;
  
  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, items.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect(items[currentIndex]);
      return;
    default:
      return;
  }
  
  if (newIndex !== currentIndex) {
    onSelect(items[newIndex], newIndex);
  }
}

/**
 * Skip to content link helper
 */
export function addSkipToContent() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded';
  skipLink.textContent = 'ข้ามไปยังเนื้อหาหลัก';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * ARIA label helpers
 */
export const ariaLabels = {
  loading: 'กำลังโหลด',
  error: 'เกิดข้อผิดพลาด',
  success: 'สำเร็จ',
  required: 'จำเป็น',
  optional: 'ไม่บังคับ',
  searchResults: (count) => `พบ ${count} ผลลัพธ์`,
  pageOf: (current, total) => `หน้า ${current} จาก ${total}`,
  sortedBy: (field) => `เรียงตาม ${field}`,
  filterActive: (count) => `มี ${count} ตัวกรองที่เปิดใช้งาน`,
};

/**
 * Form error announcement
 */
export function announceFormErrors(errors) {
  const errorCount = Object.keys(errors).length;
  if (errorCount > 0) {
    announceToScreenReader(
      `พบข้อผิดพลาด ${errorCount} ข้อ กรุณาตรวจสอบและแก้ไข`,
      'assertive'
    );
  }
}

/**
 * Live region for dynamic content
 */
export function createLiveRegion(id = 'live-region', priority = 'polite') {
  let region = document.getElementById(id);
  
  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  
  return {
    announce: (message) => {
      region.textContent = message;
    },
    clear: () => {
      region.textContent = '';
    }
  };
}
