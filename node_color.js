var color = {
    DEFAULT: "\033[m",
    BLUE: "\033[1;36m",
    YELLOW: "\033[1;33m",
    RED: "\033[1;31m",
}
var console_info = console.info;
console.info = function() {};
var console_log = console.log;
console.log = function() {};
var console_warn = console.warn;
console.warn = function() {};
var console_error = console.error;
console.error = function() {};

/**
 *
 * argv init
 *
 */
{
    for (var i = 2; i < process.argv.length; i++) {
        switch (process.argv[i]) {

            case "-sp":
                Object_Parameter.socketioport = parseInt(process.argv[i + 1]);
                break;
            case "-path":
                Object_Parameter.path = process.argv[i + 1];
                break;
            case "-info":
                console.info = function() {
                    var args = Array.prototype.slice.call(arguments);
                    process.stdout.write(color.BLUE);
                    console_info.apply(this, args);
                    process.stdout.write(color.DEFAULT);
                };
                break;
            case "-log":
                console.log = console_log;
                break;
            case "-warn":
                console.warn = function() {
                    var args = Array.prototype.slice.call(arguments);
                    process.stdout.write(color.YELLOW);
                    console_warn.apply(this, args);
                    process.stdout.write(color.DEFAULT);
                };
                break;
            case "-error":
                console.error = function() {
                    var args = Array.prototype.slice.call(arguments);
                    process.stdout.write(color.RED);
                    console_error.apply(this, args);
                    process.stdout.write(color.DEFAULT);
                };
                break;
            case "-h":
                console.log = console_log;
                console.log(PackageObject.name + " help table");
                console.log("   -info : show console.info message.");
                console.log("   -warn : show console.warn message.");
                console.log("   -error : show console.error message.");
                console.log("   -log : show console.log message.");
                process.exit(0);
                break;
            default:
                break;
        }
    }
}
