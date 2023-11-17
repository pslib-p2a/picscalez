const EventEmitter = require('events');

class Handler extends EventEmitter {
    constructor() {
        super();
        this.logs = [];
        this.errors = [];
        this.successes = [];
        this.progress = {
            general: {
                current: 0,
                total: 0,
            },
            action: {
                current: 0,
                total: 0,
            },
        };
    }

    error(log, alert = false) {
        console.error(log);
        if (alert) this.alert(log);
        this.errors.push(log);
        this.emit('error', log);
    }

    log(log, alert = false) {
        console.log(log);
        if (alert) this.alert(log);
        this.logs.push(log);
        this.emit('log', log);
    }

    success(log, alert = false) {
        console.log(log);
        if (alert) this.alert(log);
        this.successes.push(log);
        this.emit('success', log);
    }

    getLogs() {
        return this.logs;
    }

    getErrors() {
        return this.errors;
    }

    getSuccesses() {
        return this.successes;
    }

    alert(log) {
        alert(log);
    }

    setProgressGeneral(current, total) {
        this.progress.general.current = current;
        this.progress.general.total = total;
        this.emit('progress', this.progress);
        console.log(`General ${this.progress.general.current} of ${this.progress.general.total} (${this.progress.general.current / this.progress.general.total * 100}%))`);
    }

    addProgressGeneral(amount) {
        this.progress.general.current += amount;
        this.emit('progress', this.progress);
        console.log(`General ${this.progress.general.current} of ${this.progress.general.total} (${this.progress.general.current / this.progress.general.total * 100}%))`);
    }

    setProgressAction(current, total) {
        this.progress.action.current = current;
        this.progress.action.total = total;
        this.emit('progress', this.progress);
        console.log(`Action ${this.progress.action.current} of ${this.progress.action.total} (${this.progress.action.current / this.progress.action.total * 100}%))`);
    }

    addProgressAction(amount) {
        this.progress.action.current += amount;
        this.emit('progress', this.progress);
        console.log(`Action ${this.progress.action.current} of ${this.progress.action.total} (${this.progress.action.current / this.progress.action.total * 100}%))`);
    }
}

const handler = new Handler();