package angulartest.config;

import angulartest.util.MessageUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import javax.ejb.ConcurrencyManagement;
import javax.ejb.ConcurrencyManagementType;
import javax.ejb.Singleton;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.ResourceBundle;

@Singleton
@ConcurrencyManagement(ConcurrencyManagementType.CONTAINER)
@Slf4j
public class Config {

	private String filename = "angulartest.config/Config.properties";
	private Properties properties;

    private static ResourceBundle resourceBundle;

	private static final String PARAM_MONGODB_HOST = "paramMongoDbHost";
    private static final String PARAM_MONGODB_DATABASE_NAME = "paramMongoDbDatabaseName";
    private static final String MONGO_PORT = "mongoPort";
    private static final String BROADCAST_MESSAGE_DAY_OF_VALIDITY = "broadcastMessageDaysOfValidity";
    private static final String NOT_APPEARED = "notAppeared";
    private static final String NOT_RESPONDED = "notResponded";
    private static final String DEFAULT_PHONE_NUMBER = "defaultPhoneNumber";

	@Getter
	private String paramMongoDbHost;

    @Getter
    private String paramMongoDbDatabaseName;

    @Getter
    private Integer mongoPort;

    @Getter
    private String notAppeared;

    @Getter
    private String notResponded;

    @Getter
    private String defaultPhoneNumber;

    @Getter
    private int broadcastMessageDaysOfValidity;

    public Config() {
        resourceBundle = MessageUtil.newBundle(filename,"UTF-8");
        loadProperties();
        if(properties != null) {
        	try {
				paramMongoDbHost = properties.getProperty(PARAM_MONGODB_HOST);
                paramMongoDbDatabaseName = properties.getProperty(PARAM_MONGODB_DATABASE_NAME);
                mongoPort = Integer.parseInt(properties.getProperty(MONGO_PORT));
                broadcastMessageDaysOfValidity = Integer.parseInt(resourceBundle.getString(BROADCAST_MESSAGE_DAY_OF_VALIDITY));
                notAppeared = resourceBundle.getString(NOT_APPEARED);
                notResponded = resourceBundle.getString(NOT_RESPONDED);
                defaultPhoneNumber = resourceBundle.getString(DEFAULT_PHONE_NUMBER);
        	} catch (NumberFormatException ex) {
        		ex.printStackTrace();
        	}
        }
    }

    private double[] loadDoubleArray(String values){
        List<Double> res = new ArrayList<>();
       
        if(values != null){
           String[] splittedValues = values.split(",");
          
           for (int i = 0; i < splittedValues.length; i++) {
        	   res.add(Double.valueOf(splittedValues[i]));
           }
        }
        
        double[] array = new double[res.size()];
        for (int i = 0; i < res.size(); i++) {
            array[i] = res.get(i);
        }
       
        return array;
     }
    
	
	private void loadProperties(){
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(filename)){
            if (input == null) {
                log.error("Sorry, unable to find " + filename);
                return;
            }

            properties = new Properties();
            properties.load(input);
        } catch (IOException ex) {
           log.error(ex.toString());
        }
   }

}
