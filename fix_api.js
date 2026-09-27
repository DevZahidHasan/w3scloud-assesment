const fs = require('fs');

function fix(file, badStr, goodStr) {
  const path = 'src/app/api/' + file + '/route.ts';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(badStr, goodStr);
  fs.writeFileSync(path, content, 'utf8');
}

fix('contacts', "name: updatedRecord.Full_Name || ${updatedRecord.First_Name || ''} .trim(),", "name: updatedRecord.Full_Name || `${updatedRecord.First_Name || ''} ${updatedRecord.Last_Name || ''}`.trim(),");
fix('leads', "name: updatedLead.Full_Name || ${updatedLead.First_Name || ''} .trim(),", "name: updatedLead.Full_Name || `${updatedLead.First_Name || ''} ${updatedLead.Last_Name || ''}`.trim(),");
fix('accounts', "name: updatedRecord.Account_Name || ${updatedRecord.First_Name || ''} .trim(),", "name: updatedRecord.Account_Name || 'N/A',");

console.log("Fixed smoothly!");
