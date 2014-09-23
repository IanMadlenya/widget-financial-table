# Widget Financial Table [![Build Status](http://devtools1.risevision.com:8080/job/Widget-Financial-Table-Master-Build/badge/icon)](http://devtools1.risevision.com:8080/job/Widget-Financial-Table-Master-Build/)

## Introduction

The Financial Table Widget displays financial data in table form.

Financial Table Widget works in conjunction with [Rise Vision](http://www.risevision.com), the [digital signage management application](http://rva.risevision.com/) that runs on [Google Cloud](https://cloud.google.com).

At this time Chrome is the only browser that this project and Rise Vision supports.

## Built With
- NPM (node package manager)
- Angularjs
- Gulp
- Bower
- Karma and Mocha for testing

## Development

### Local Development Environment Setup and Installation

* install the latest Node.js and NPM version, run this to install:

* clone the repo using Git to your local:
```bash
git clone https://github.com/Rise-Vision/widget-financial-table.git
```

* cd into the repo directory
```bash
cd widget-financial-table
```

* from the root of the repo run this command to install all npm dependencies
```bash
npm install
```

* install Bower globally using the NPM install cmd:
```bash
npm install -g bower
```

* run Bower install to install all bower dependencies:
```bash
bower install
```

* install Gulp globally using the NPM install cmd:
```bash
npm install -g gulp
```

### Run Local

To previes Widgets locally, you'll have to run the Widget Preview app (https://github.com/Rise-Vision/widget-preview) available for download at http://192.254.220.36/~rvi/widget-preview/.

### Dependencies

* **Gulp** - is used as a task runner. It lints, runs unit tests and E2E (end to end) tests, minimizes files, etc.  all dependencies for this is in the gulp.js file.
* **Bower** - is used as a package manager for javascript libraries and frameworks. All third-party javascript frameworks and libraries are listed as dependencies in the bower.json file.
* **NPM & Nodejs** - the node package manager is used in hand in hand with gulp to start a server to host the app and all the dependencies needed from using a node server. All these node dependencies are listed in the package.json file

### Testing

To run unit and E2E testing, do
```bash
gulp test
```

## Submitting Issues
If you encounter problems or find defects we really want to hear about them. If you could take the time to add them as issues to this Repository it would be most appreciated. When reporting issues please use the following format where applicable:

**Reproduction Steps**

1. did this
2. then that
3. followed by this (screenshots / video captures always help)

**Expected Results**

What you expected to happen.

**Actual Results**

What actually happened. (screenshots / video captures always help)

## Contributing
All contributions are greatly appreciated and welcome! If you would first like to sound out your contribution ideas please post your thoughts to our [community](http://community.risevision.com), otherwise submit a pull request and we will do our best to incorporate it

## Resources
If you have any questions or problems please don't hesitate to join our lively and responsive community at http://community.risevision.com.

If you are looking for user documentation on Rise Vision please see http://www.risevision.com/help/users/

If you would like more information on developing applications for Rise Vision please visit http://www.risevision.com/help/developers/.

**Facilitator**

[Alex Deaconu](https://github.com/alex-deaconu)