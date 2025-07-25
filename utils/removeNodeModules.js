const path = require('path');
const executeBash = require('../utils/executeBash');

module.exports = async function deleteNodeModules(id) {
  const targetPath = path.join(process.env.clone_output_path, id, 'node_modules');

  try {
    await executeBash(`rm -rf "${targetPath}"`);
    console.log(`✅ node_modules deleted: ${targetPath}`);
  } catch (error) {
    console.error(`❌ Failed to delete node_modules for ${id}:`, error);
    throw new Error(`Cleanup failed for ${id}: ${error.message}`);
  }
};
