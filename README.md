# Commande démarer un nv projet

npm init 

# Relancer un nouveau docker 

# Remove postgres container.
docker container rm postgres -f

docker run --name postgres -p 5432:5432 \
	-e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mydb \
	-v ./init.sql:/docker-entrypoint-initdb.d/init.sql -d postgres