import type { TextSelection } from "@/types/editor";

function createRangeFromOffsets(root: HTMLElement, start: number, end: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startNodeOffset = 0;
  let endNodeOffset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const nextOffset = currentOffset + node.data.length;

    if (!startNode && start <= nextOffset) {
      startNode = node;
      startNodeOffset = Math.max(0, start - currentOffset);
    }

    if (!endNode && end <= nextOffset) {
      endNode = node;
      endNodeOffset = Math.max(0, end - currentOffset);
      break;
    }

    currentOffset = nextOffset;
  }

  return { startNode, endNode, startNodeOffset, endNodeOffset };
}

export function getContentEditableSelection(root: HTMLElement): TextSelection {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { start: 0, end: 0 };
  }

  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return { start: 0, end: 0 };
  }

  const preStartRange = range.cloneRange();
  preStartRange.selectNodeContents(root);
  preStartRange.setEnd(range.startContainer, range.startOffset);

  const preEndRange = range.cloneRange();
  preEndRange.selectNodeContents(root);
  preEndRange.setEnd(range.endContainer, range.endOffset);

  return {
    start: preStartRange.toString().length,
    end: preEndRange.toString().length,
  };
}

export function restoreContentEditableSelection(root: HTMLElement, selection: TextSelection) {
  const { startNode, endNode, startNodeOffset, endNodeOffset } = createRangeFromOffsets(root, selection.start, selection.end);
  if (!startNode || !endNode) return;

  const range = document.createRange();
  range.setStart(startNode, Math.min(startNodeOffset, startNode.length));
  range.setEnd(endNode, Math.min(endNodeOffset, endNode.length));

  const current = window.getSelection();
  if (!current) return;
  current.removeAllRanges();
  current.addRange(range);
}
