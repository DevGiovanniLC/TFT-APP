require('dotenv').config();
const { execSync } = require('child_process');

const token = process.env.SONAR_TOKEN;

if (!token) {
    console.error('❌ SONAR_TOKEN no definido en el archivo .env');
    process.exit(1);
}

execSync(`sonar-scanner.bat `
    + `-D"sonar.projectKey=vita-Weight" `
    + `-D"sonar.sources=." `
    + `-D"sonar.host.url=http://localhost:9000" `
    + `-D"sonar.token=${token}"`, { stdio: 'inherit' });
