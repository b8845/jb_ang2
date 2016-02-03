package angulartest.mongodb;

import com.mongodb.DB;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.Morphia;
import org.mongodb.morphia.query.Query;
import angulartest.config.Config;

import javax.annotation.PostConstruct;
import javax.ejb.*;

@Singleton
@ConcurrencyManagement(ConcurrencyManagementType.CONTAINER)
public class MongoClientProvider extends AbstractMongoClientProvider{

    private static String databaseName = null;

    private static Config config = new Config();

    private MongoClient mongoClient = null;

    private Morphia morphia = null;

    private Datastore datastore = null;

    @Lock(LockType.READ)
    public MongoClient getMongoClient(){
        return mongoClient;
    }

    @Lock(LockType.READ)
    public Datastore getDatastore(){ return datastore; }

    public <T> Query<T> createQuery(Class<T> clazz) {
        return getDatastore().createQuery(clazz);
    }

    @PostConstruct
    public void init() {
        String mongoIpAddress = config.getParamMongoDbHost();
        Integer mongoPort = config.getMongoPort();
        databaseName = config.getParamMongoDbDatabaseName();

        mongoClient = new MongoClient(mongoIpAddress, mongoPort);
        morphia = new Morphia();
        datastore = morphia.createDatastore(mongoClient, databaseName);
    }

    public MongoDatabase getDatabase() {
        return getMongoClient().getDatabase(databaseName);
    }

    public DB getDeprecatedDatabase() {
        return getMongoClient().getDB(databaseName);
    }
}
