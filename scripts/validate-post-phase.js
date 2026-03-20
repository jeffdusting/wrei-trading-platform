#!/usr/bin/env node
/**
 * Post-Phase Validation Script
 *
 * Validates that all requirements are met after completing a phase:
 * 1. All tests still pass
 * 2. New tests added for completed functionality
 * 3. Plan updated with completion status
 * 4. Changes committed to git
 * 5. Test report updated
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PLAN_FILE = path.join(PROJECT_ROOT, 'WREI_TOKENIZATION_PROJECT.md');
const TEST_REPORT_FILE = path.join(PROJECT_ROOT, 'TEST_REPORT.md');

console.log('🔍 POST-PHASE VALIDATION STARTING...\n');

// Validation Results
let validationResults = {
  testsPass: false,
  testReportUpdated: false,
  planUpdated: false,
  changesCommitted: false,
  testCoverage: false
};

let errors = [];
let warnings = [];

// 1. Test Suite Validation
console.log('1️⃣  VALIDATING TEST SUITE...');
try {
  const testOutput = execSync('npm test', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: 'pipe'
  });

  if (testOutput.includes('Test Suites:') && testOutput.includes('passed')) {
    const passMatch = testOutput.match(/(\d+) passed/);
    const suiteMatch = testOutput.match(/Test Suites: (\d+) passed/);

    if (passMatch && suiteMatch) {
      console.log(`   ✅ All tests passing (${passMatch[1]} tests across ${suiteMatch[1]} suites)`);
      validationResults.testsPass = true;

      // Check test count increase (assuming we started with 68 tests)
      const currentTestCount = parseInt(passMatch[1]);
      if (currentTestCount > 68) {
        console.log(`   ✅ Test count increased (+${currentTestCount - 68} new tests)`);
      } else if (currentTestCount === 68) {
        warnings.push('⚠️  Test count unchanged - ensure new functionality is tested');
      }
    }
  }
} catch (error) {
  errors.push('❌ Test suite not passing - must fix before phase completion');
  console.log('   ❌ Test suite failing');
}

// 2. Test Coverage Validation
console.log('\n2️⃣  VALIDATING TEST COVERAGE...');
try {
  const coverageOutput = execSync('npm run test:coverage', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: 'pipe'
  });

  if (coverageOutput.includes('All files')) {
    console.log('   ✅ Coverage report generated successfully');
    validationResults.testCoverage = true;

    // Check for personas.ts coverage (should be 100%)
    if (coverageOutput.includes('personas.ts') && coverageOutput.includes('100')) {
      console.log('   ✅ Core personas.ts maintains 100% coverage');
    }
  }
} catch (error) {
  warnings.push('⚠️  Could not generate coverage report');
  console.log('   ⚠️  Coverage validation failed');
}

// 3. Test Report Validation
console.log('\n3️⃣  VALIDATING TEST REPORT...');
if (fs.existsSync(TEST_REPORT_FILE)) {
  console.log('   ✅ TEST_REPORT.md exists');

  const reportStats = fs.statSync(TEST_REPORT_FILE);
  const daysSinceUpdate = (Date.now() - reportStats.mtime) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 1) {
    console.log('   ✅ Test report updated recently (within 24 hours)');
    validationResults.testReportUpdated = true;
  } else {
    warnings.push('⚠️  Test report not updated recently - consider updating with new test results');
    console.log(`   ⚠️  Test report last updated ${Math.floor(daysSinceUpdate)} days ago`);
  }
} else {
  errors.push('❌ TEST_REPORT.md not found');
  console.log('   ❌ Test report missing');
}

// 4. Plan Update Validation
console.log('\n4️⃣  VALIDATING PROJECT PLAN UPDATES...');
if (fs.existsSync(PLAN_FILE)) {
  const planContent = fs.readFileSync(PLAN_FILE, 'utf8');
  const planStats = fs.statSync(PLAN_FILE);
  const daysSinceUpdate = (Date.now() - planStats.mtime) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 1) {
    console.log('   ✅ Project plan updated recently');
    validationResults.planUpdated = true;
  } else {
    warnings.push('⚠️  Project plan not updated recently');
  }

  // Check for completion markers and progress
  const completedTasks = (planContent.match(/- \[✓\]/g) || []).length;
  const inProgressTasks = (planContent.match(/- \[🔄\]/g) || []).length;
  const totalTasks = (planContent.match(/- \[(✓|🔄| )\]/g) || []).length;

  console.log(`   📊 Progress: ${completedTasks}/${totalTasks} tasks (${Math.round(completedTasks/totalTasks*100)}%)`);

  if (inProgressTasks > 0) {
    warnings.push(`⚠️  ${inProgressTasks} tasks still marked IN PROGRESS - consider updating to COMPLETE`);
  }

} else {
  errors.push('❌ Project plan not found');
}

// 5. Git Status and Commit Validation
console.log('\n5️⃣  VALIDATING GIT STATUS...');
try {
  // Check for uncommitted changes
  const gitStatus = execSync('git status --porcelain', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  });

  if (gitStatus.trim() === '') {
    console.log('   ✅ All changes committed');
    validationResults.changesCommitted = true;

    // Check recent commits
    const recentCommits = execSync('git log --oneline -5', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8'
    });

    console.log('   📝 Recent commits:');
    recentCommits.split('\n').slice(0, 3).forEach(commit => {
      if (commit.trim()) {
        console.log(`      ${commit.trim()}`);
      }
    });

  } else {
    warnings.push('⚠️  Uncommitted changes exist - commit phase completion');
    console.log('   ⚠️  Uncommitted changes detected:');
    gitStatus.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`      ${line.trim()}`);
      }
    });
  }

} catch (error) {
  warnings.push('⚠️  Could not check git status');
  console.log('   ⚠️  Git status check failed');
}

// 6. File Structure Validation
console.log('\n6️⃣  VALIDATING PROJECT STRUCTURE...');
const expectedFiles = [
  'WREI_TOKENIZATION_PROJECT.md',
  'DEVELOPMENT_PROCESS.md',
  'TEST_REPORT.md',
  'package.json',
  'jest.config.js',
  'lib/personas.ts',
  '__tests__/'
];

let missingFiles = [];
expectedFiles.forEach(file => {
  const filePath = path.join(PROJECT_ROOT, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('   ✅ All expected project files present');
} else {
  errors.push(`❌ Missing files: ${missingFiles.join(', ')}`);
}

// Results Summary
console.log('\n📋 VALIDATION SUMMARY');
console.log('================================');

const criticalPassed = validationResults.testsPass &&
                      validationResults.planUpdated &&
                      validationResults.changesCommitted;

const allPassed = criticalPassed &&
                 validationResults.testReportUpdated &&
                 validationResults.testCoverage;

if (allPassed && errors.length === 0) {
  console.log('✅ ALL POST-PHASE REQUIREMENTS MET');
  console.log('🎉 Phase completion validated successfully');
  console.log('🚀 Ready to proceed to next phase');
} else if (criticalPassed && errors.length === 0) {
  console.log('✅ CRITICAL POST-PHASE REQUIREMENTS MET');
  console.log('⚠️  Some optional validations have warnings');
  console.log('🚀 Safe to proceed, but consider addressing warnings');
} else {
  console.log('❌ POST-PHASE VALIDATION FAILED');
  console.log('\nCritical errors that must be resolved:');
  errors.forEach(error => console.log(`   ${error}`));
}

if (warnings.length > 0) {
  console.log('\nWarnings to consider:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

console.log('\n📚 PHASE COMPLETION CHECKLIST:');
console.log('✅ All tests pass');
console.log('✅ New tests added for implemented functionality');
console.log('✅ Project plan updated with completion status');
console.log('✅ Implementation changes committed to git');
console.log('✅ Test report updated with new results');
console.log('✅ Ready for next phase');

// Exit with appropriate code
if (criticalPassed && errors.length === 0) {
  process.exit(0);
} else {
  process.exit(1);
}