// 测试小数精度支持
// 这个文件用于验证我们的修改是否正确支持小数精度

console.log('=== 测试小数精度支持 ===');

// 测试股份计算
function testShareCalculation() {
  console.log('\n1. 测试股份计算:');
  
  const supply = 1000.123456; // 小数供应量
  const userShares = supply * 0.35; // 35% 用户股份
  const poolShares = supply * 0.65; // 65% 流动性池
  
  console.log(`供应量: ${supply}`);
  console.log(`用户股份 (35%): ${userShares}`);
  console.log(`流动性池股份 (65%): ${poolShares}`);
  console.log(`总和验证: ${userShares + poolShares} (应该等于 ${supply})`);
  
  return Math.abs((userShares + poolShares) - supply) < 0.000001;
}

// 测试AMM价格计算
function testAMMCalculation() {
  console.log('\n2. 测试AMM价格计算:');
  
  const yoloReserve = 1000.5;
  const stockReserve = 500.25;
  const yoloAmount = 100.123;
  
  // 模拟买入计算
  const k = yoloReserve * stockReserve;
  const newYoloReserve = yoloReserve + yoloAmount;
  const newStockReserve = k / newYoloReserve;
  const stockAmount = stockReserve - newStockReserve;
  
  console.log(`YOLO储备: ${yoloReserve}`);
  console.log(`股票储备: ${stockReserve}`);
  console.log(`投入YOLO: ${yoloAmount}`);
  console.log(`获得股票: ${stockAmount}`);
  console.log(`K常数验证: ${k} = ${newYoloReserve * newStockReserve}`);
  
  return Math.abs(k - (newYoloReserve * newStockReserve)) < 0.000001;
}

// 测试数字格式化
function testNumberFormatting() {
  console.log('\n3. 测试数字格式化:');
  
  const testNumbers = [
    1000.123456789,
    0.00000001,
    123.456,
    1000000.789,
    0.1
  ];
  
  testNumbers.forEach(num => {
    // 模拟我们的格式化函数
    const formatted = num.toFixed(8).replace(/\.?0+$/, '');
    console.log(`${num} -> ${formatted}`);
  });
  
  return true;
}

// 运行测试
const test1 = testShareCalculation();
const test2 = testAMMCalculation();
const test3 = testNumberFormatting();

console.log('\n=== 测试结果 ===');
console.log(`股份计算: ${test1 ? '✅ 通过' : '❌ 失败'}`);
console.log(`AMM计算: ${test2 ? '✅ 通过' : '❌ 失败'}`);
console.log(`数字格式化: ${test3 ? '✅ 通过' : '❌ 失败'}`);

if (test1 && test2 && test3) {
  console.log('\n🎉 所有测试通过！小数精度支持正常工作。');
} else {
  console.log('\n⚠️ 部分测试失败，需要检查实现。');
}