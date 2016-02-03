package angulartest.entity.base;

import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.bson.types.ObjectId;
import org.mongodb.morphia.annotations.Id;

public class AbstractMongoEntity implements ObjectWithId<ObjectId>{

    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    @JsonDeserialize(using = ToObjectIdDeserializer.class)
    @JsonView(Object.class)
    private ObjectId id;

    @Override
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId parameter) {
        this.id = parameter;
    }

    public AbstractMongoEntity withId(ObjectId id){
        setId(id);

        return this;
    }
}
