package angulartest.util;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.MessageFormat;
import java.util.*;

/**
 * Segédosztály a message bundle-k eléréséhez
 */
@Slf4j
public final class MessageUtil extends ResourceBundle{
    private static ResourceBundle defaultMessageBoundle;
    private static final String BUNDLE_NAME = "messages/messages.properties";
    private static final String BUNDLE_ENCODING = "UTF-8";

    public MessageUtil() {
        setParent(newBundle(BUNDLE_NAME, BUNDLE_ENCODING));
    }

    /**
     * Az alapértelmezett message bundle elérése
     * @return alapértelmezett message bundle
     */
    public static ResourceBundle getDefaultMessageBundle() {
        if(defaultMessageBoundle == null){
            try{
                defaultMessageBoundle = newBundle(BUNDLE_NAME, BUNDLE_ENCODING);
            }catch(MissingResourceException e){
                log.error(e.getMessage());
            }
        }

        return defaultMessageBoundle;
    }

    /**
     * @param baseName bundle név
     * @param format karakter kódolás
     * @return új message bundle
     */
    public static ResourceBundle newBundle(String baseName, String format)
    {
        ResourceBundle bundle = null;
        try {
//			baseName = baseName.replaceAll("\\.", "/");
//			baseName += ".properties";
            InputStream stream = null;
            stream = Thread.currentThread().getContextClassLoader().getResourceAsStream(baseName);
            if (stream != null) {
                try {
                    bundle = new PropertyResourceBundle(new InputStreamReader(stream, format));
                } finally {
                    stream.close();
                }
            }
        } catch (IOException e) {
            log.error(e.getMessage());
        }

        return bundle;
    }

    /**
     * A megadott érték lekérdezése a message bundle-ből
     * @param key kulcs
     * @param boundle boundle név
     * @return keyhez tartozó érték
     */
    public static String getValue(String key, ResourceBundle boundle){
        String result = key;
        if(key!=null && boundle!=null && boundle.containsKey(key)){
            result = boundle.getString(key);
        }

        return result;
    }
    /**
     * visszaadja a default locale-ben a keyhez tartozó értéket
     * @param key kulcs
     * @return default locale-ben a keyhez tartozó érték
     */
    public static String getValue(String key){
        return getValue(key, getDefaultMessageBundle());
    }

    /**
     * A megadott érték lekérdezése a message bundle-ből, paraméterek behelyetesítésével
     * @param key kulcs
     * @param params paraméterek
     * @return bundle-ben lévő érték paraméterek és kulcs alapján
     */
    public static String getValueWithParams(String key, Object... params)
    {
        String result = "?? key " + key + " not found ??";
        try {
            result = getValue(key);
            result = MessageFormat.format(result, params);
        }catch (MissingResourceException e) {
            log.error(e.toString());
        }

        return result;
    }

    @Override
    protected Object handleGetObject(String key) {
        return parent.getObject(key);
    }

    @Override
    public Enumeration<String> getKeys() {
        return parent.getKeys();
    }
}

