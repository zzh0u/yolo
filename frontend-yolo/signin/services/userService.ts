// 存根用户服务
export async function saveUser(userData: any) {
  console.log('Saving user:', userData);
  // 在实际实现中，这里调用后端 API 保存用户
  return { success: true };
}