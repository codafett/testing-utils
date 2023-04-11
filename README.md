# `@tiney/testing-utils`

# Introduction

This packages is to enable the use of API/Db testing within services.

It was originally delivered in @tiney/infra but needs to live in it's own package so that we can update independently in other packages
when we update the references in this package (i.e. typeORM and Jest in particular)

# Usage

This package should be installed as a DEV dependency only
