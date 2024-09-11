const express = require('express');
const router = express.Router();

function createLicenseCheckApi(connection) {
  router.get('/checklicense', (req, res) => {
    const licenseKey = req.query.licenseKey;
    const product = req.query.product;
    const serverIp = req.query.serverIp; // Use query parameter for IP

    const sql = "SELECT * FROM license_table WHERE license_key = ? AND product = ?";
    connection.query(sql, [licenseKey, product], (err, result) => {
      if (err) {
        console.error('Error when connecting with database: ' + err.message);
        res.json({
          status: 'INVALID',
          buyer: '',
          message: 'Database bağlanamadı'
        });
      } else {
        if (result.length > 0) {
          const buyer = result[0].username;
          const usedIps = JSON.parse(result[0].used_ips || '[]');

          if (usedIps.includes(serverIp)) {
            res.json({
              status: 'VALID',
              buyer: buyer
            });
          } else {
            res.json({
              status: 'INVALID',
              buyer: '',
              message: 'IP Adresi Doğrulanamadı'
            });
          }
        } else {
          res.json({
            status: 'INVALID',
            buyer: '',
            message: 'Lisans bulunamadı'
          });
        }
      }
    });
  });

  return router;
}

module.exports = createLicenseCheckApi;
