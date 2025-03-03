export function getPriorityColor(priority: number): string {
  // Use CSS variables from global styles
  return `var(--priority-${priority}, #757575)`;
} 