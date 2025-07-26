import { v4 as uuidv4 } from 'uuid';
import { saveUser } from '../services/userService'; // 假设有用户服务

export async function handleSignInUser(user: any, account: any) {
  const uuid = uuidv4();
  const signin_type = 'oauth';
  const signin_provider = account.provider;
  const nickname = user.name;
  const avatar_url = user.image;
  const email = user.email;
  // 调用保存用户服务
  await saveUser({ uuid, signin_type, signin_provider, nickname, avatar_url, email });
}