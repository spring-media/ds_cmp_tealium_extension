const _myCW = {

    leadingZero: function(num) {
        return num < 10 ? '0' + num.toString() : num.toString();

    },

    getDayOfWeek: function(date, day) {
        const dow = date.getDate() - date.getDay() + day;
        const newDate = new Date(date.valueOf());
        newDate.setDate(dow);
        return newDate;
    },

    getWeek: function(date) {
        const oneJan = new Date(date.getFullYear(),0,1);
        const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
        return this.leadingZero(Math.ceil(( date.getDay() + 1 + numberOfDays) / 7));
    },

    //date=Wed Jan 27 2021... returns 01.27
    getMonthDay: function(date) {
        return this.leadingZero(date.getMonth()+1) + '.' + this.leadingZero(date.getDate());
    },

    //date=Wed Jan 27 2021... CW 2021.01.25. - 01.31.
    getCW: function() {
        const currentDate = new Date();
        const firstDOW = this.getDayOfWeek(currentDate, 1);
        const lastDOW = this.getDayOfWeek(currentDate, 7);

        return 'CW' + ' ' 
        + this.getWeek(currentDate) + ' ' 
        + firstDOW.getFullYear().toString() + '.' 
        + this.getMonthDay(firstDOW) + '.' + ' - ' 
        + this.getMonthDay(lastDOW) + '.';
        
    },

    init: function() {
        window.utag.data.myCW = this.getCW();
    },

};

if (typeof exports === 'object') {
    // Export object with all functions for unit testing
    module.exports = _myCW;
}
else {
    _myCW.init();
}



