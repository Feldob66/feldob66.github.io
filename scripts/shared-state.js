// Shared state and helpers for drag ghost and theme unlock

let dragGhost = null;
let darkModeUnlocked = localStorage.getItem('darkModeUnlocked') === 'true';

function createDragGhost(element) {
    // Only show drag ghost on touch devices (tablets/phones)
    // On desktop/laptop with mouse, the cursor is already visible so no need for ghost
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    if (!isTouchDevice) {
        return null; // Don't create ghost on devices with mouse/hover capability
    }

    if (dragGhost) dragGhost.remove();

    dragGhost = element.cloneNode(true);

    // Copy exact dimensions from original
    const rect = element.getBoundingClientRect();
    dragGhost.style.width = rect.width + 'px';
    dragGhost.style.height = rect.height + 'px';

    // Position and styling
    dragGhost.style.position = 'fixed';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.zIndex = '10000';
    dragGhost.style.opacity = '0.8';
    dragGhost.style.transform = 'translate(-50%, -50%)';
    dragGhost.style.boxShadow = '0 4px 20px rgba(80, 250, 123, 0.6)';
    dragGhost.style.transition = 'none';

    // Preserve all computed styles
    const computed = window.getComputedStyle(element);
    dragGhost.style.background = computed.background;
    dragGhost.style.border = computed.border;
    dragGhost.style.borderRadius = computed.borderRadius;
    dragGhost.style.padding = computed.padding;
    dragGhost.style.fontSize = computed.fontSize;
    dragGhost.style.fontFamily = computed.fontFamily;
    dragGhost.style.color = computed.color;
    dragGhost.style.fontWeight = computed.fontWeight;
    dragGhost.style.textAlign = computed.textAlign;
    dragGhost.style.lineHeight = computed.lineHeight;
    dragGhost.style.whiteSpace = 'pre-wrap';
    dragGhost.style.wordWrap = 'break-word';
    dragGhost.style.overflowWrap = 'break-word';

    // For visual mode elements (donuts/circles), preserve layout
    if (element.classList.contains('donut') || element.classList.contains('inner-circle')) {
        dragGhost.style.display = computed.display;
        dragGhost.style.justifyContent = computed.justifyContent;
        dragGhost.style.alignItems = computed.alignItems;

        // Copy styles for all children
        const originalChildren = element.querySelectorAll('*');
        const cloneChildren = dragGhost.querySelectorAll('*');
        originalChildren.forEach((child, index) => {
            if (cloneChildren[index]) {
                const childComputed = window.getComputedStyle(child);
                const childClone = cloneChildren[index];
                childClone.style.position = childComputed.position;
                childClone.style.top = childComputed.top;
                childClone.style.left = childComputed.left;
                childClone.style.right = childComputed.right;
                childClone.style.bottom = childComputed.bottom;
                childClone.style.transform = childComputed.transform;
                childClone.style.width = childComputed.width;
                childClone.style.height = childComputed.height;
            }
        });
    }

    document.body.appendChild(dragGhost);
    return dragGhost;
}

function removeDragGhost() {
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
}

function updateDragGhostPosition(x, y) {
    if (dragGhost) {
        dragGhost.style.left = x + 'px';
        dragGhost.style.top = y + 'px';
    }
}
