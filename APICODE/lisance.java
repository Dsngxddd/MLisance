    private static String licenseKey;
    public static String discordlink = "discord.gg/SupportDCLINK";
    public static String pluginname = "MCORDSYNC";
    public static String URL = "http://api.batukubi.com:8080/api/checklicense?licenseKey=";
    public static String PRODUCT = "MCORDSYNC";

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();
        licenseKey = getConfig().getString("license.key");
        String serverIp = getServer().getIp();
        String JSON_URL = URL + licenseKey + "&product=" + PRODUCT + "&serverIp=" + serverIp;

        Bukkit.getConsoleSender().sendMessage(Color.translate(pluginname + ".."));
        Bukkit.getConsoleSender().sendMessage(Color.translate("&b"));
        Bukkit.getConsoleSender().sendMessage(Color.translate("&bMCORDSYNC Yükleniyor..."));
        Bukkit.getConsoleSender().sendMessage(Color.translate("&bhttps://mcordsync.com"));
        Bukkit.getConsoleSender().sendMessage(Color.translate("&b"));

        try {
            String jsonString = readUrl(JSON_URL);

            JSONObject json = new JSONObject(jsonString);
            String status = json.getString("status");
            String buyer = json.getString("buyer");
            String message = json.optString("message", "");

            if ("VALID".equals(status)) {
                Bukkit.getConsoleSender().sendMessage(Color.translate("&f"));
                if (buyer.isEmpty()) {
                    Bukkit.getConsoleSender().sendMessage(Color.translate("&fMerhaba &bN/A&f!"));
                    Bukkit.getConsoleSender().sendMessage(Color.translate("&fLisans Durumu&a " + status));
                    Bukkit.getConsoleSender().sendMessage(Color.translate("&fEğer desteğe ihtiyacın var ise &b" + discordlink));
                } else {
                    Bukkit.getConsoleSender().sendMessage(Color.translate("&fMerhaba, &b" + buyer + "&f!"));
                    Bukkit.getConsoleSender().sendMessage(Color.translate("&fLisans Durumu&a " + status));
                    Bukkit.getConsoleSender().sendMessage(Color.translate("&fEğer desteğe ihtiyacın var ise &b" + discordlink));
                }
                Bukkit.getConsoleSender().sendMessage(Color.translate("&f"));
            } else if ("INVALID".equals(status)) {
                Bukkit.getConsoleSender().sendMessage(Color.translate("&f"));
                Bukkit.getConsoleSender().sendMessage(Color.translate("&fMerhaba, &bN/A&f!"));
                Bukkit.getConsoleSender().sendMessage(Color.translate("&fLisans Durumun &c " + status + " &7&o(" + licenseKey + ")"));
                Bukkit.getConsoleSender().sendMessage(Color.translate("&f" + message));
                Bukkit.getPluginManager().disablePlugin(this);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Bukkit.getPluginManager().disablePlugin(this);
        }

    }

}
