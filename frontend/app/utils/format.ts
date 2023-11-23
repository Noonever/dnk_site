export const formatDate = (date: string) => {
    if (date === '') {
        return ''
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    let day = d.getDate();
    if (day < 10) {
        day = '0' + day.toString()
    }
    return `${day}.${month}.${year}`
}