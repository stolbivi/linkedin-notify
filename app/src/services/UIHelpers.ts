const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const isToday = (someDate: Date) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

export const formatDate = (timestamp: Date) =>
    isToday(timestamp) ? timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    }) : `${MONTH_NAMES[timestamp.getMonth()]} ${timestamp.getDate()}`;

export const formatDateToday = (timestamp: Date) =>
    isToday(timestamp) ? "Today" : `${MONTH_NAMES[timestamp.getMonth()]} ${timestamp.getDate()}`;