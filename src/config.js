const config = {
    // 基础接口地址
    baseUrl: "https://api.sangerbox.com/api",

    wxcUrl: "http://api.sangerbox.com/wxc",
    // http://api.sangerbox.com/wxc
  
    // #超时设置（毫秒）
    timeout: 10000,
  
    // #本地存储 key
    storageKeys: {
      token: "auth_token",
      userInfo: "user_info",
    },
  
    // #默认分页参数
    pagination: {
      pageSize: 10,
      currentPage: 1,
    },
  
    // #角色定义
    roles: {
      admin: "admin",
      merchant: "merchant",
    },


    // 默认邮件模板
    EMAIL_HTML_TEMPLATE:
    `
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>模拟发送</title>
        <style>
            body {
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background-color: #4A90E2;
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 30px;
                text-align: center;
            }
            .verification-code {
                font-size: 36px;
                font-weight: bold;
                color: #4A90E2;
                margin: 30px 0;
                letter-spacing: 5px;
            }
            .info {
                background-color: #f8f9fa;
                border-left: 4px solid #4A90E2;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 12px;
            }
            .company-name {
                font-weight: bold;
                color: #4A90E2;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{subject}}</h1>
            </div>
            <div class="content">
                <p>您好！</p>
                <p>您正在使用 <span class="company-name">{{companyName}}</span> 的服务，</p>
                <p>请使用以下验证码完成您的操作：</p>
                
                <div class="verification-code">{{verificationCode}}</div>
                
                <div class="info">
                    <p><strong>验证码类型：</strong>{{templateTypeDescription}}</p>
                    <p><strong>有效时间：</strong>5分钟</p>
                    <p><strong>安全提醒：</strong>请勿将验证码透露给他人</p>
                </div>
                
                <p>如非本人操作，请忽略此邮件。</p>
            </div>
            <div class="footer">
                <p>此邮件由 <span class="company-name">{{companyName}}</span> 系统自动发送，请勿回复。</p>
                <p>{{currentYear}} {{companyName}}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `
  };
  
  export default config;
  