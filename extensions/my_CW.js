const _myCW = {
    // Add a leading zero to numbers less than 10
    leadingZero: function(num) {
        return num < 10 ? '0' + num : num.toString();
    },

    // Get the date for the specified day of the current week
    getDayOfWeek: function(date, day) {
        const dow = date.getDate() - date.getDay() + day;
        const newDate = new Date(date);
        newDate.setDate(dow);
        return newDate;
    },

    // Get the week number of the year for the specified date
    getWeek: function(date) {
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
        return this.leadingZero(Math.ceil((date.getDay() + 1 + numberOfDays) / 7));
    },

    // Get the month and day in MM.DD format
    getMonthDay: function(date) {
        return this.leadingZero(date.getMonth() + 1) + '.' + this.leadingZero(date.getDate());
    },

    // Get the current calendar week in the format CW YYYY.WW MM.DD. - MM.DD.
    getCW: function() {
        const currentDate = new Date();
        const firstDOW = this.getDayOfWeek(currentDate, 1); // Monday
        const lastDOW = this.getDayOfWeek(currentDate, 7); // Sunday

        return (
            'CW ' +
            this.getWeek(currentDate) +
            ' ' +
            firstDOW.getFullYear() +
            '.' +
            this.getMonthDay(firstDOW) +
            ' - ' +
            this.getMonthDay(lastDOW) +
            '.'
        );
    },

    // Initialize and set the myCW property on window.utag.data
    init: function() {
        if (window.utag && window.utag.data) {
            window.utag.data.myCW = this.getCW();
        }
    }
};

if (typeof exports === 'object') {
    // Export object with all functions for unit testing
    module.exports = _myCW;
} else {
    _myCW.init();
}
