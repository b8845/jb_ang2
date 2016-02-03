package angulartest.mongodb;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.mongodb.morphia.Datastore;

/**
 * Created by Deak on 2015.07.08..
 */
public abstract class AbstractMongoClientProvider {
    protected MongoClient mongoClient = null;

    protected Datastore datastore = null;

    protected MongoDatabase database = null;

    public MongoClient getMongoClient(){
        return mongoClient;
    }

    public Datastore getDatastore(){
        return datastore;
    }

    public MongoDatabase getDatabase(){
        return database;
    }
}