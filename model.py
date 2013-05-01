class BikeRacks(Base):
	__tablename__ = "bikeracks"

	id = Column(Integer)
	latitude = Column(Float)
	longitude = Column(Float)

	def __init__(self, id, latitude, longitude):
		self.id = id
		self.latitude = latitude
		self.longitude = longitude

Base = declarative_base()
