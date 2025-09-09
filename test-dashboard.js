// Dashboard Testing Script
// Run this in browser console to test functionality

(function() {
  console.log('🧪 Starting Dashboard Tests...');
  
  const tests = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  function test(name, condition) {
    if (condition) {
      console.log(`✅ ${name}`);
      tests.passed++;
    } else {
      console.log(`❌ ${name}`);
      tests.failed++;
      tests.errors.push(name);
    }
  }
  
  // Test DOM Elements
  test('Dashboard app container exists', !!document.getElementById('app'));
  test('Sidebar exists', !!document.getElementById('sidebar'));
  test('Main content area exists', !!document.querySelector('.main'));
  test('Right panel exists', !!document.querySelector('.right-panel'));
  
  // Test Navigation Elements
  test('Navigation links exist', document.querySelectorAll('.nav-link').length > 0);
  test('Date range buttons exist', document.querySelectorAll('.date-btn').length > 0);
  test('Action buttons exist', document.querySelectorAll('.action-btn').length > 0);
  
  // Test Chart Containers
  test('Revenue chart canvas exists', !!document.getElementById('revenue-chart'));
  test('Conversion chart canvas exists', !!document.getElementById('conversion-chart'));
  test('Traffic chart canvas exists', !!document.getElementById('traffic-chart'));
  test('Sales chart canvas exists', !!document.getElementById('sales-chart'));
  test('Performance chart canvas exists', !!document.getElementById('performance-chart'));
  
  // Test KPI Cards
  test('KPI cards exist', document.querySelectorAll('.kpi-card').length >= 4);
  test('Revenue KPI element exists', !!document.getElementById('revenue-kpi'));
  
  // Test Data Table
  test('Data table exists', !!document.getElementById('transactions-table'));
  test('Data table body exists', !!document.getElementById('transactions-body'));
  
  // Test Mobile Elements
  test('Mobile sidebar toggle exists', !!document.querySelector('.sidebar-toggle'));
  test('Mobile overlay exists', !!document.querySelector('.mobile-overlay'));
  
  // Test CSS Loading
  test('Design system CSS loaded', getComputedStyle(document.body).getPropertyValue('--color-primary').trim() !== '');
  test('Dashboard theme class applied', document.body.classList.contains('dashboard-theme'));
  
  // Test JavaScript Module Loading
  test('Chart.js library loaded', typeof Chart !== 'undefined');
  
  // Test Responsive Classes
  const width = window.innerWidth;
  const expectedClass = width <= 767 ? 'mobile' : width <= 991 ? 'tablet' : 'desktop';
  test(`Correct responsive class applied (${expectedClass})`, document.body.classList.contains(expectedClass) || width > 991);
  
  // Test Accessibility
  test('ARIA labels present on buttons', 
    Array.from(document.querySelectorAll('button')).some(btn => btn.hasAttribute('aria-label'))
  );
  
  // Summary
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📋 Total: ${tests.passed + tests.failed}`);
  
  if (tests.errors.length > 0) {
    console.log('\n❌ Failed tests:');
    tests.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (tests.failed === 0) {
    console.log('\n🎉 All tests passed! Dashboard structure is ready.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  // Performance check
  console.log('\n⚡ Performance Check:');
  console.log(`Page load time: ${Math.round(performance.now())}ms`);
  console.log(`DOM nodes: ${document.getElementsByTagName('*').length}`);
  console.log(`CSS rules: ${Array.from(document.styleSheets).reduce((acc, sheet) => {
    try {
      return acc + sheet.cssRules.length;
    } catch (e) {
      return acc;
    }
  }, 0)}`);
  
  return {
    passed: tests.passed,
    failed: tests.failed,
    errors: tests.errors,
    success: tests.failed === 0
  };
})();
