var assert = require('chai').assert;
var rewire = require('rewire');

var log = require('../lib/log');

var session = rewire('../lib/session');
var plugin = rewire('../lib/core');

describe('core', function() {
  var PROBLEMS = [
    {
      category: 'algorithms',
      id:       0,
      name:     'name0',
      slug:     'slug0',
      level:    'Hard',
      locked:   true,
      starred:  false,
      state:    'ac',
      tags:     ['google', 'facebook']
    },
    {
      category:  'algorithms',
      companies: ['amazon', 'facebook'],
      id:        1,
      name:      'name1',
      slug:      'slug1',
      level:     'Easy',
      locked:    false,
      starred:   true,
      state:     'none'
    }
  ];
  var USER = {};
  var NEXT = {};

  before(function() {
    log.init();

    session.getUser = function() {
      return USER;
    };

    plugin.__set__('session', session);
    plugin.setNext(NEXT);
  });

  beforeEach(function() {
    NEXT.getProblems = function(cb) {
      return cb(null, PROBLEMS);
    };
    NEXT.getProblem = function(problem, cb) {
      return cb(null, problem);
    };
  });

  describe('#filterProblems', function() {
    it('should filter by query ok', function(done) {
      var cases = [
        ['',     [0, 1]],
        ['x',    [0, 1]],
        ['h',    [0]],
        ['H',    [1]],
        ['m',    []],
        ['M',    [0, 1]],
        ['l',    [0]],
        ['L',    [1]],
        ['s',    [1]],
        ['S',    [0]],
        ['d',    [0]],
        ['D',    [1]],
        ['eLsD', [1]],
        ['Dh',   []]
      ];
      var n = cases.length;
      cases.forEach(function(x) {
        plugin.filterProblems({query: x[0]}, function(e, problems) {
          assert.equal(e, null);
          assert.equal(problems.length, x[1].length);
          for (var i = 0; i < problems.length; ++i)
            assert.equal(problems[i], PROBLEMS[x[1][i]]);
          if (--n === 0) done();
        });
      });
    });

    it('should filter by tag ok', function(done) {
      var cases = [
        [[],           [0, 1]],
        [['facebook'], [0, 1]],
        [['google'],   [0]],
        [['amazon'],   [1]],
        [['apple'],    []],
      ];
      var n = cases.length;
      cases.forEach(function(x) {
        plugin.filterProblems({tag: x[0]}, function(e, problems) {
          assert.equal(e, null);
          assert.equal(problems.length, x[1].length);
          for (var i = 0; i < problems.length; ++i)
            assert.equal(problems[i], PROBLEMS[x[1][i]]);
          if (--n === 0) done();
        });
      });
    });
  });

  describe('#starProblem', function() {
    it('should starProblem ok', function(done) {
      NEXT.starProblem = function(problem, starred, cb) {
        return cb(null, starred);
      };

      assert.equal(PROBLEMS[0].starred, false);
      plugin.starProblem(PROBLEMS[0], true, function(e, starred) {
        assert.equal(e, null);
        assert.equal(starred, true);
        done();
      });
    });

    it('should starProblem ok if already starred', function(done) {
      assert.equal(PROBLEMS[1].starred, true);
      plugin.starProblem(PROBLEMS[1], true, function(e, starred) {
        assert.equal(e, null);
        assert.equal(starred, true);
        done();
      });
    });

    it('should starProblem ok if already unstarred', function(done) {
      assert.equal(PROBLEMS[0].starred, false);
      plugin.starProblem(PROBLEMS[0], false, function(e, starred) {
        assert.equal(e, null);
        assert.equal(starred, false);
        done();
      });
    });
  }); // #starProblem

  describe('#exportProblem', function() {
    it('should codeonly ok', function() {
      var expected = [
        '/**',
        ' * Definition for singly-linked list.',
        ' * struct ListNode {',
        ' *     int val;',
        ' *     ListNode *next;',
        ' *     ListNode(int x) : val(x), next(NULL) {}',
        ' * };',
        ' */',
        'class Solution {',
        'public:',
        '    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {',
        '        ',
        '    }',
        '};',
        ''
      ].join('\n');

      var problem = require('./mock/add-two-numbers.20161015.json');
      var opts = {
        lang: 'cpp',
        code: problem.templates[0].defaultCode,
        tpl:  'codeonly'
      };
      assert.equal(plugin.exportProblem(problem, opts), expected);
    });

    it('should detailed ok', function() {
      var expected = [
        '/*',
        ' * [2] Add Two Numbers',
        ' *',
        ' * https://leetcode.com/problems/add-two-numbers',
        ' *',
        ' * algorithms',
        ' * Medium (25.37%)',
        ' * Total Accepted:    195263',
        ' * Total Submissions: 769711',
        ' * Testcase Example:  \'[2,4,3]\\n[5,6,4]\'',
        ' *',
        ' * You are given two linked lists representing two non-negative numbers. The',
        ' * digits are stored in reverse order and each of their nodes contain a single',
        ' * digit. Add the two numbers and return it as a linked list.',
        ' * ',
        ' * Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)',
        ' * Output: 7 -> 0 -> 8',
        ' */',
        '/**',
        ' * Definition for singly-linked list.',
        ' * struct ListNode {',
        ' *     int val;',
        ' *     ListNode *next;',
        ' *     ListNode(int x) : val(x), next(NULL) {}',
        ' * };',
        ' */',
        'class Solution {',
        'public:',
        '    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {',
        '        ',
        '    }',
        '};',
        ''
      ].join('\n');

      var problem = require('./mock/add-two-numbers.20161015.json');
      var opts = {
        lang: 'cpp',
        code: problem.templates[0].defaultCode,
        tpl:  'detailed'
      };
      assert.equal(plugin.exportProblem(problem, opts), expected);
    });

    it('should detailed ok, 2nd', function() {
      var expected = [
        '#',
        '# [2] Add Two Numbers',
        '#',
        '# https://leetcode.com/problems/add-two-numbers',
        '#',
        '# algorithms',
        '# Medium (25.37%)',
        '# Total Accepted:    195263',
        '# Total Submissions: 769711',
        '# Testcase Example:  \'\'',
        '#',
        '# You are given two linked lists representing two non-negative numbers. The',
        '# digits are stored in reverse order and each of their nodes contain a single',
        '# digit. Add the two numbers and return it as a linked list.',
        '# ',
        '# Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)',
        '# Output: 7 -> 0 -> 8',
        '#',
        '# Definition for singly-linked list.',
        '# class ListNode',
        '#     attr_accessor :val, :next',
        '#     def initialize(val)',
        '#         @val = val',
        '#         @next = nil',
        '#     end',
        '# end',
        '',
        '# @param {ListNode} l1',
        '# @param {ListNode} l2',
        '# @return {ListNode}',
        'def add_two_numbers(l1, l2)',
        '    ',
        'end',
        ''
      ].join('\n');

      var problem = require('./mock/add-two-numbers.20161015.json');
      problem.testcase = null;
      var opts = {
        lang: 'ruby',
        code: problem.templates[6].defaultCode,
        tpl:  'detailed'
      };
      assert.equal(plugin.exportProblem(problem, opts), expected);
    });
  }); // #exportProblem

  describe('#getProblem', function() {
    it('should getProblem by id ok', function(done) {
      plugin.getProblem(0, function(e, problem) {
        assert.equal(e, null);
        assert.deepEqual(problem, PROBLEMS[0]);
        done();
      });
    });

    it('should getProblem by key ok', function(done) {
      plugin.getProblem('slug0', function(e, problem) {
        assert.equal(e, null);
        assert.deepEqual(problem, PROBLEMS[0]);
        done();
      });
    });

    it('should getProblem error if not found', function(done) {
      plugin.getProblem(3, function(e, problem) {
        assert.equal(e, 'Problem not found!');
        done();
      });
    });

    it('should getProblem fail if client error', function(done) {
      NEXT.getProblem = function(problem, cb) {
        return cb('client getProblem error');
      };

      plugin.getProblem(0, function(e, problem) {
        assert.equal(e, 'client getProblem error');
        done();
      });
    });

    it('should getProblem random ok', function(done) {
      NEXT.getProblems = function(cb) {
        return cb(null, [
          {id: 0, state: 'ac', locked: false},
          {id: 1, state: 'none', locked: true},
          {id: 2, state: 'none', locked: false}
        ]);
      };

      plugin.getProblem('', function(e, problem) {
        assert.equal(e, null);
        assert.equal(problem.id, 2);
        done();
      });
    });

    it('should getProblem fail if getProblems error', function(done) {
      NEXT.getProblems = function(cb) {
        return cb('getProblems error');
      };

      plugin.getProblem(0, function(e, problem) {
        assert.equal(e, 'getProblems error');
        done();
      });
    });
  }); // #getProblem
});
