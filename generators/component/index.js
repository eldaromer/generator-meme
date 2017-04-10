'use strict';
var Generator = require('yeoman-generator');
var mkdirp = require('mkdirp');
var fs = require('fs');

var that;

module.exports = class extends Generator {

    //Prompts user for input
    prompting () {
        return this.prompt([{
            type: 'input',
            name: 'compName',
            message: 'What would you like to name this component?'
        }, {
            type: 'confirm',
            name: 'angConf',
            message: 'Does this component have a frontend use?',
            default: true
        }, {
            type: 'confirm',
            name: 'backConf',
            message: 'Does this component have a backend use?',
            default: true
        }, {
            type: 'confirm',
            name: 'routeConf',
            message: 'Would you like to add the generic route?',
            default: true
        }]).then((answers) => {
            this.answers = answers;
            //Modifies component name to correct format
            this.answers.compName = this.answers.compName.replace("\\s+","");
            this.answers.compName = this.answers.compName.charAt(0).toUpperCase() + this.answers.compName.slice(1);
            //Sets context, desperately needs changing
            that = this;
        });
    }

    config() {

        //Gets configurations from config file
        that.settings = this.config.getAll();
        //Adds component to auto-generated list if it isn't already there
        if (this.answers.routeConf && this.answers.angConf) {
            if(!that.settings.components.includes(this.answers.compName)) {
                that.settings.components.push(this.answers.compName);
            }
        }
        if (this.answers.backConf) {
            if(!that.settings.backComponents.includes(this.answers.compName)) {
                that.settings.backComponents.push(this.answers.compName);
            }
        }
        //Resets components
        this.config.set("components", that.settings.components);
        this.config.set("backComponents", that.settings.backComponents);
        this.log(that.settings);
    }

    //Adds folders in frontend and backend if needed
    configuring () {
        if (this.answers.angConf) {
            mkdirp.sync("app/frontend/components/" + this.answers.compName);
        }

        if (this.answers.backConf) {
            mkdirp.sync("app/backend/" + this.answers.compName);
        }
    }

    writing () {

        //Builds frontend files from template
        if (this.answers.angConf) {
            this.fs.copyTpl(
                this.templatePath('dynamic/app/frontend/template.component.js'),
                this.destinationPath('app/frontend/components/' + this.answers.compName + '/' + this.answers.compName + '.component.js'),
                { compName : this.answers.compName,
                  acronym: that.settings.acronym}
            );

            this.fs.copy(
                this.templatePath('static/app/frontend/template.html'),
                this.destinationPath('app/frontend/components/' + this.answers.compName + '/' + this.answers.compName + '.html')
            );


        }

        //Builds backend files from template
        if (this.answers.backConf) {
            this.fs.copyTpl(
                this.templatePath('dynamic/app/backend/template.model.js'),
                this.destinationPath('app/backend/' + this.answers.compName + '/' + this.answers.compName + '.model.js'),
                { compName: this.answers.compName }
            );

            this.fs.copyTpl(
                this.templatePath('dynamic/app/backend/template.route.js'),
                this.destinationPath('app/backend/' + this.answers.compName + '/' + this.answers.compName + '.route.js'),
                { compName: this.answers.compName }
            );

            var data = fs.readFileSync('app/backend/index.js', 'utf-8');
            var newData = data.slice(0);
            var start = newData.indexOf("//Auto-Configured Models - DO NOT TOUCH") + "//Auto-Configured Models - DO NOT TOUCH".length;
            var end = newData.indexOf("//End Models");
            newData = [newData.slice(0, start), newData.slice(end)].join('');
            var insert = "";
            for (var i = 0; i < that.settings.backComponents.length; i++) {
                insert+= "\n\tmodels.createModel(require('./" + that.settings.backComponents[i] + "/" + that.settings.backComponents[i] + ".models.js'))";
            }
            newData = [newData.slice(0, start), insert + "\n", "\t" + newData.slice(start)].join('');
            fs.writeFileSync('app/backend/index.js', newData, 'utf-8');

            data = fs.readFileSync('app/backend/index.js', 'utf-8');
            newData = data.slice(0);
            start = newData.indexOf("//Auto-Configured Routes - DO NOT TOUCH") + "//Auto-Configured Routes - DO NOT TOUCH".length;
            end = newData.indexOf("//End Routes");
            newData = [newData.slice(0, start), newData.slice(end)].join('');
            insert = "";
            for (var i = 0; i < that.settings.backComponents.length; i++) {
                insert+= "\n\trouter.use('/" + that.settings.backComponents[i] + "', require('./" + that.settings.backComponents[i] + "/" + that.settings.backComponents[i] + ".routes.js')(app))";
            }
            newData = [newData.slice(0, start), insert + "\n", "\t" + newData.slice(start)].join('');
            fs.writeFileSync('app/backend/index.js', newData, 'utf-8');


        }

        //Edits frontend routes file
        if (this.answers.routeConf && this.answers.angConf) {
            var data = fs.readFileSync('app/frontend/js/config.js', 'utf-8');
            var newData = data.slice(0);
            var start = newData.indexOf("//Auto-Configured Routes - DO NOT TOUCH") + "//Auto-Configured Routes - DO NOT TOUCH".length;
            var end = newData.indexOf("//End Routes");
            newData = [newData.slice(0, start), newData.slice(end)].join('');
            var insert = "";
            for (var i = 0; i < that.settings.components.length; i++) {
                insert+="\n\t\t\t.when('/" + that.settings.components[i] + "', {\n" +
                        "\t\t\t\tname: '" + that.settings.components[i] + "',\n" +
                        "\t\t\t\ttemplate: '<" + that.settings.acronym + "-" + that.settings.components[i].toLowerCase() + ">'\n" +
                        "\t\t\t})";
            }
            newData = [newData.slice(0, start), insert + "\n", "\t\t" + newData.slice(start)].join('');
            fs.writeFileSync('app/frontend/js/config.js', newData, 'utf-8');
        }

    }

    //Closing statements
    end () {
        this.log("");
        this.log("Please take the following actions or your application will NOT work.");
        this.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        this.log("");
        this.log("");
        this.log("Update the 'app/backend/index.js' file to include your new component");
        this.log("");
        this.log("Update the 'app/frontend/js/config.js' file to include the url path to your new component")
    }

};