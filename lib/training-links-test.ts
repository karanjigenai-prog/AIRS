/**
 * Test file to demonstrate skill-specific training link functionality
 * This shows how the system now provides relevant training based on actual skills
 */

import { getTrainingResourcesForSkill, getBestTrainingResourceForSkill, generateTrainingLinksHTML } from './training-links'

// Test different skill scenarios
console.log('=== SKILL-SPECIFIC TRAINING LINKS TEST ===\n')

// Test 1: Machine Learning
console.log('1. Machine Learning Training:')
const mlResources = getTrainingResourcesForSkill('Machine Learning')
mlResources.forEach(resource => {
  console.log(`   - ${resource.name} (${resource.provider}) - ${resource.url}`)
})

console.log('\n2. Best ML Resource:')
const bestML = getBestTrainingResourceForSkill('Machine Learning')
console.log(`   - ${bestML.name}: ${bestML.url}`)

// Test 2: Java
console.log('\n3. Java Training:')
const javaResources = getTrainingResourcesForSkill('Java')
javaResources.forEach(resource => {
  console.log(`   - ${resource.name} (${resource.provider}) - ${resource.url}`)
})

// Test 3: AWS
console.log('\n4. AWS Training:')
const awsResources = getTrainingResourcesForSkill('AWS')
awsResources.forEach(resource => {
  console.log(`   - ${resource.name} (${resource.provider}) - ${resource.url}`)
})

// Test 4: Multiple skills HTML generation
console.log('\n5. HTML for Multiple Skills (Machine Learning, Java, AWS):')
const htmlOutput = generateTrainingLinksHTML(['Machine Learning', 'Java', 'AWS'])
console.log(htmlOutput)

// Test 5: Unknown skill fallback
console.log('\n6. Unknown Skill Fallback:')
const unknownResources = getTrainingResourcesForSkill('SomeUnknownSkill')
unknownResources.forEach(resource => {
  console.log(`   - ${resource.name} (${resource.provider}) - ${resource.url}`)
})

export { }
