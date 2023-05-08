from flask import Flask, request
import graphene
from flask_graphql import GraphQLView
import gymnasium as gym
import numpy as np
import json
from flask_cors import CORS

env = None

class Field(graphene.ObjectType):
    name = graphene.String()
    values = graphene.List(graphene.Float)
    shape = graphene.List(graphene.Float)

    def __init__(self, name, values, shape):
        self.name = name
        self.values = values
        self.shape = shape
    
    def resolve_name(self, info):
        return self.name

    def resolve_values(self, info):
        return self.values

    def resolve_shape(self, info):
        return self.shape

    

class Observation(graphene.ObjectType):
    fields = graphene.List(Field)
    pixels = graphene.Field(graphene.JSONString)

    def __init__(self, observation, pixels):
        self.fields = [Field("base", observation, list(observation.shape))]
        #self.fields = [Field("base", [observation], [1])]
        self.pixels = json.dumps(pixels.tolist())

    def resolve_fields(self, info):
        return self.fields

    def resolve_pixels(self, info):
        return self.pixels


class Query(graphene.ObjectType):
    observation = graphene.Field(Observation)

    def resolve_observation(self, info):
        action = env.action_space.sample()
        observation = env.step(action)[0]
        pixels = env.render()

        ret = Observation(observation, pixels)
        return ret






def serve_env(env_name: str):
    global env
    env =  gym.make(env_name, render_mode="rgb_array")
    env.reset()

    app = Flask(__name__)
    CORS(app)

    schema = graphene.Schema(query=Query)

    app.add_url_rule('/graphql', view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,
    ))

    app.run()

