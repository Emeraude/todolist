#!/usr/bin/node

var colors = {
    "black": 0,
    "red": 1,
    "green": 2,
    "yellow": 3,
    "blue": 4,
    "magenta": 5,
    "cyan": 6,
    "white": 7,
    "standard": 9
};

var fs = require('fs');
var _ = require('lodash');
var db = require('./db.json');

function printBySeverity(severity) {
    _.eachRight(severity, function(i) {
	if (db.color)
	    console.log('\033[3'+colors[db.severity_colors[i]]+'m'+i+' - '+db.severity_names[i]+'\033[0m\n');
	else
	    console.log(i+' - '+db.severity_names[i] + '\n');
	_.each(db.values, function(j) {
	    if (j && j.severity == i)
		console.log(j.id + ':' + j.content);
	});
    });
}

function compactPrint(severity) {
    var string = '';
    _.eachRight(severity, function(i) {
	var count = 0;
	_.each(db.values, function(j) {
	    if (j && j.severity == i)
		++count;
	});
	if (count) {
	    if (db.color)
		string += '\033[3'+colors[db.severity_colors[i]]+'m'+count+db.severity_names[i][0]+'\033[0m';
	    else
		string += count+db.severity_names[i][0];
	}
    });
    console.log(string);
}

for (var i = 0; i < process.argv.length; ++i) {
    if (process.argv[i].match(/^(-c|--color)$/i))
	db.color = true;
    else if (process.argv[i].match(/^--nocolor$/i))
	db.color = false;
    else if (process.argv[i] == 'add') {
	var newEntry = {
	    "id": ++db.last_id,
	    "severity": 0,
	    "content": process.argv[++i],
	    "added": new Date
	};
	if (process.argv[i + 1] && process.argv[i + 1].match(/^[0-2]$/))
	    newEntry.severity = parseInt(process.argv[++i]);
	db.values.push(newEntry);
    }
    else if (process.argv[i] == 'list') {
	if (process.argv[i + 1] && process.argv[i + 1].match(/^[0-2]$/))
	    printBySeverity([process.argv[++i]]);
	else
	    printBySeverity([0, 1, 2]);
    }
    else if (process.argv[i] == 'count') {
	if (process.argv[i + 1] && process.argv[i + 1].match(/^[0-2]$/))
	    compactPrint([process.argv[++i]]);
	else
	    compactPrint([0, 1, 2]);
    }
    else if (process.argv[i] == 'delete') {
	if (process.argv[i + 1] && process.argv[i + 1].match(/^\d*$/)) {
	    for (j in db.values) {
		if (db.values[j] && db.values[j].id == parseInt(process.argv[i + 1]))
		    delete db.values[j];
	    }
	    ++i;
	}
    }
    else if (process.argv[i] == 'drop') {
	db.values = [];
    }
}

fs.writeFile('db.json', JSON.stringify(db, null, 4), function(err) {
    ;
});
