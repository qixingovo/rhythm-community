import { FetchClient, Config } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new FetchClient(config);

async function fetchDocuments() {
  const urls = [
    'https://coze-coding-project.tos.coze.site/create_attachment/2026-05-26/1312191795701596_b308e341af0481e65990aa84c9cd4954_2026-05-26-rhythm-community-design.md?sign=4901857798-46d4951ae4-0-f1630d971da3b79919ad047bce0876a48076c0fa6fc187d9406bbce23034afbb',
    'https://coze-coding-project.tos.coze.site/create_attachment/2026-05-26/1312191795701596_08967cc84c6763e9992bc93011e481b9_2026-05-26-rhythm-community-plan.md?sign=4901857803-f1b1a87ec6-0-40aa8629379bf5007f3f02ce787d32ecb225e936018d9ccca512b4b1da4ffc08'
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await client.fetch(urls[i]);
      console.log(`\n========== 文档 ${i + 1} ==========`);
      console.log(`标题: ${response.title}`);
      
      const textContent = response.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
      
      console.log('内容:');
      console.log(textContent);
    } catch (error) {
      console.error(`获取文档 ${i + 1} 失败:`, error);
    }
  }
}

fetchDocuments();