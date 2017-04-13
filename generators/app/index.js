'use strict';
var Generator = require('yeoman-generator');
var mkdirp = require('mkdirp');
var gulp = require('gulp');
var inject = require('gulp-inject');

//Variable to hold specific this for async acronym request
var gen;

//Variable to hold specific this for file writing
var writer;

//Variable to hold specific this for installation
var installer;

module.exports = class extends Generator {

    //Constructor function if changes are needed for the constructor
    constructor (args, opts) {
        super(args, opts);

        //this.argument('argName', {type: String, required: true};
        //this.log(this.options.argName);
    }

    //I don't know what to put in this function lmao
    initializing () {
        this.log("Welcome to the meme generator.....");
        this.log("Generating Modular Enterprisable MEAN Environment");
        this.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        this.log("");
        this.log("");
    }

    //Prompting user for project parameters
    prompting () {
        this.log("Welcome Developer:");
        this.log("Please configure your project.");
        this.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        this.log("");
        this.log("");

        //Begin asynchronous prompting process
        return this.prompt([{
            type: 'input',
            name: 'appName',
            message: 'What is the name of your app?',
            required: true,
            default: this.appname,
            validate: function (input) {
                var done = this.async();

                setTimeout(function() {
                    var reg = /^[a-zA-Z ]+$/;
                    if (!reg.test(input)) {
                        done('Name can only contain english letters and spaces.');
                    } else if (input.replace(/ +/g, '').length < 2) {
                        done('Name must be at least 2 letters long');
                    }
                    done(null, true);
                }, 100);
            }
        }, {
            type: 'input',
            name: 'description',
            message: 'What is the description of your app?'
        }, {
            type: 'input',
            name: 'authorName',
            message: 'What is your name?'
        }]).then((answers) => {
            //Handle answers once the user has provided all of them
            this.answers = answers;
            this.answers.fullName = this.answers.appName;
            this.answers.appName = this.answers.appName.replace(/ +/g, '-').toLowerCase();

            //Initialize form for POST request
            var request = require('request');
            var subform = {};
            subform["F_QueryType"] = "AdvancedSearch2";

            for (var i = 0; i <= 9; i++) {
                for (var j = 0; j <= 9; j++) {
                    subform["tx_" + i + "_" + j] = "";
                }
            }

            var name = this.answers.fullName;

            //Make sure that there will be at least two words in the request so that it doesn't crash
            if (name.indexOf(' ') == -1) {

                name = name.substring(0, name.length/2) + ' ' + name.substring(name.length/2);
            }

            //Splits keywords
            var words = name.split(' ');


            //Constructs custom part of POST form
            for (var i = 0; i < words.length; i++) {
                subform["tx_" + i + "_0"] = words[i];
            }

            subform["ShowOptions"] = "closed";
            subform["F_word_list_languages_english_big"] = "on";

            //Send POST request
            request.post({url:'http://acronymcreator.net/ace.py', form: subform}, this._acronym);

            this.log('The name you chose is: ', answers.appName);
            this.log("");
        });
    }

    config () {
        //Assign gen as the local context needed
        gen = this;
        //Set configs to be saved later
        this.config.set('appName', this.answers.appName);
        this.config.set('description', this.answers.description);
        this.config.set('authorName', this.answers.authorName);
        this.config.set('fullName', this.answers.fullName);
        this.config.set('components', []);
        this.config.set('backComponents', []);
    }

    configuring (name) {
        this.log("Building folder nest......");
        this.log("");

        //Building folder tree
        mkdirp.sync("app");
        mkdirp.sync("app/backend");
        mkdirp.sync("app/backend/Auth");
        mkdirp.sync("app/backend/Providers");
        mkdirp.sync("app/frontend");
        mkdirp.sync("app/frontend/bower_components");
        mkdirp.sync("app/frontend/components");
        mkdirp.sync("app/frontend/css");
        mkdirp.sync("app/frontend/imgs");
        mkdirp.sync("app/frontend/js");
        mkdirp.sync("app/frontend/js/Factories");
        this.log("");
    }

    default () {}

    writing () {
        this.log("Writing Static Files.....");
        this.log("");

        writer = this;

        //Copy static files
        this.fs.copy(
            this.templatePath('static/**/*'),
            this.destinationRoot()
        );

        this.log("Writing Dot Files.....");
        this.log("");

        //Copy dot-files
        this.fs.copy(
            this.templatePath('static/.*'),
            this.destinationRoot()
        );

        this.log("");
        this.log("Building and writing dynamic files from template");
        this.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        this.log("");
        this.log("");

        //Copy files using templates and given parameters
        this.fs.copyTpl(
            this.templatePath('dynamic/**/*'),
            this.destinationRoot(),
            {
                appName: this.answers.appName,
                description: this.answers.description,
                authorName: this.answers.authorName
            }
        );

        this.log("");
    }

    conflicts () {}

    install () {
        //Set correct instance for installer
        var installer = this;

        //Installs node & bower components
        this.spawnCommand('npm', ['install'])
            .on('close', function () {
                installer.spawnCommand('bower', ['install'])
                    .on('close', function () {
                        //Runs gulp task on finish
                        installer.spawnCommand('gulp', ['inject'])
                            .on('close', function () {
                                console.log("");
                                console.log("Finished injecting Files.");
                                console.log("");
                                console.log("");

                                console.log("");
                                console.log("I'm wrapping up now!");
                                console.log("Please perform these recommended actions as well");
                                console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                                console.log("");
                                console.log("");
                                console.log("Run 'yo meme:component' to create a component with the name 'name'");
                                console.log("");
                                console.log("Don't forget to add the following to the 'app/frontend/bower_components/bootstrap/bower.json' file");
                                console.log("");
                                console.log("\"main\": [");
                                console.log("\t\"dist/css/bootstrap.css\",");
                                console.log("\t\"dist/js/bootstrap.js\"");
                                console.log("]");
                                console.log("");
                                console.log("");
                                console.log("Run 'gulp inject' whenever you add a new file amd run 'gulp start' to create an automatically updating server.");
                            });
                    });
            });

    }

    //Function to web-scrape the project acronym from https://acronymcreator.net
    _acronym(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);

        var regex = /(?:(<td[^<>]*>\s*))[A-Za-z]+(?:(\s*<\/td>))/g;

        var matches = [], match;

        while(match = regex.exec(body)) {
            matches.push(match[0]);
        }

        var fin = "";
        var first = false;
        for (var x = 0; x < matches[0].length; x++) {

            if (matches[0][x] == '<') {
                first = false;
            }

            if(first) {
                fin+=matches[0][x];
            }

            if (matches[0][x] == '>') {
                first = true;
            }
        }

        fin = fin.replace(/\s/g, '');

        writer.fs.copyTpl(
            this.templatePath('extra/**/*'),
            this.destinationRoot(),
            {
                appName: this.answers.appName,
                description: this.answers.description,
                authorName: this.answers.authorName,
                acronym: fin.toLowerCase()
            }
        );

        gen.config.set('acronym', fin.toLowerCase());
        gen.config.save();
    }

    //Closes Up
    end () {

    }

};