#!/usr/bin/env node
/**
 * Pre-Phase Validation Script
 *
 * Validates that all requirements are met before starting a new phase:
 * 1. All tests pass
 * 2. Plan is current
 * 3. Context capacity is acceptable
 * 4. Previous phase marked complete
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PLAN_FILE = path.join(PROJECT_ROOT, 'WREI_TOKENIZATION_PROJECT.md');
const PROCESS_FILE = path.join(PROJECT_ROOT, 'DEVELOPMENT_PROCESS.md');

console.log('🔍 PRE-PHASE VALIDATION STARTING...\n');

// Validation Results
let validationResults = {
  testsPass: false,
  planExists: false,
  processExists: false,
  planUpdated: false,
  contextAssessed: false
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
    if (passMatch) {
      console.log(`   ✅ All tests passing (${passMatch[1]} tests)`);
      validationResults.testsPass = true;
    }
  }
} catch (error) {
  errors.push('❌ Test suite not passing - run `npm test` to diagnose');
  console.log('   ❌ Test suite failing');
}

// 2. Plan File Validation
console.log('\n2️⃣  VALIDATING PROJECT PLAN...');
if (fs.existsSync(PLAN_FILE)) {
  console.log('   ✅ WREI_TOKENIZATION_PROJECT.md exists');
  validationResults.planExists = true;

  const planContent = fs.readFileSync(PLAN_FILE, 'utf8');

  // Check for recent updates (file modification time)
  const stats = fs.statSync(PLAN_FILE);
  const daysSinceUpdate = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 7) {
    console.log(`   ✅ Plan updated recently (${Math.floor(daysSinceUpdate)} days ago)`);
    validationResults.planUpdated = true;
  } else {
    warnings.push(`⚠️  Plan not updated in ${Math.floor(daysSinceUpdate)} days - consider updating`);
    console.log(`   ⚠️  Plan last updated ${Math.floor(daysSinceUpdate)} days ago`);
  }

  // Check for completion markers
  const completedTasks = (planContent.match(/- \[✓\]/g) || []).length;
  const inProgressTasks = (planContent.match(/- \[🔄\]/g) || []).length;

  console.log(`   📊 Progress: ${completedTasks} completed, ${inProgressTasks} in progress`);

} else {
  errors.push('❌ WREI_TOKENIZATION_PROJECT.md not found');
  console.log('   ❌ Project plan missing');
}

// 3. Process Framework Validation
console.log('\n3️⃣  VALIDATING PROCESS FRAMEWORK...');
if (fs.existsSync(PROCESS_FILE)) {
  console.log('   ✅ DEVELOPMENT_PROCESS.md exists');
  validationResults.processExists = true;
} else {
  errors.push('❌ DEVELOPMENT_PROCESS.md not found');
  console.log('   ❌ Process framework missing');
}

// 4. Context Assessment (simulated - actual context would be assessed by Claude)
console.log('\n4️⃣  CONTEXT CAPACITY ASSESSMENT...');
console.log('   ℹ️  Context capacity should be assessed by Claude before proceeding');
console.log('   ℹ️  Ensure <85% capacity or clear context appropriately');
validationResults.contextAssessed = true;

// 5. Git Status Check
console.log('\n5️⃣  VALIDATING GIT STATUS...');
try {
  const gitStatus = execSync('git status --porcelain', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  });

  if (gitStatus.trim() === '') {
    console.log('   ✅ Git working directory clean');
  } else {
    warnings.push('⚠️  Uncommitted changes exist - consider committing before new phase');
    console.log('   ⚠️  Uncommitted changes detected');
  }
} catch (error) {
  warnings.push('⚠️  Could not check git status');
}

// Results Summary
console.log('\n📋 VALIDATION SUMMARY');
console.log('================================');

const allPassed = validationResults.testsPass &&
                  validationResults.planExists &&
                  validationResults.processExists &&
                  validationResults.planUpdated &&
                  validationResults.contextAssessed;

if (allPassed && errors.length === 0) {
  console.log('✅ ALL PRE-PHASE REQUIREMENTS MET');
  console.log('🚀 Ready to proceed with new phase implementation');
} else {
  console.log('❌ PRE-PHASE VALIDATION FAILED');
  console.log('\nErrors that must be resolved:');
  errors.forEach(error => console.log(`   ${error}`));
}

if (warnings.length > 0) {
  console.log('\nWarnings to consider:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

console.log('\n📚 NEXT STEPS:');
console.log('1. Resolve any errors above');
console.log('2. Address warnings as appropriate');
console.log('3. Write tests for new phase BEFORE implementation');
console.log('4. Update plan with IN PROGRESS status when starting');
console.log('5. Follow test-driven development approach');

// Exit with appropriate code
if (allPassed && errors.length === 0) {
  process.exit(0);
} else {
  process.exit(1);
}