import axios from "axios";
import React, {useState, useEffect} from 'react';
import {DeleteOutlined} from "@ant-design/icons";
import {Button, Card, Col, Input, Modal, Row, Empty, Spin, Divider, Typography, Tag} from "antd";

const token = 'b4950c7d61f0976220c3754b81a78068690a9856';

const restAPI = axios.create({
    baseURL: 'http://0.0.0.0:8080/api/v0',
    // baseURL: 'https://django-api.efunctional.com/api/v0',
    headers: {
        'Content-Type': 'application/json',
    },
});

const useAuthAPI = () => {
    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const authAPI = {
        get: (url, config) => restAPI.get(url, {...config, ...authConfig}),
        post: (url, data, config) => restAPI.post(url, data, {...config, ...authConfig}),
        put: (url, data, config) => restAPI.put(url, data, {...config, ...authConfig}),
        patch: (url, data, config) => restAPI.patch(url, data, {...config, ...authConfig}),
        delete: (url, config) => restAPI.delete(url, {...config, ...authConfig}),
    };

    return authAPI;
}


const SalesManager = ({manager, onPercentageChange, onDelete}) => {
    return (
        <Row>
            <Col>
                <span>{manager.first_name} {manager.last_name}</span>
                <Input
                    type="number"
                    value={manager.percentage}
                    onChange={e => onPercentageChange(manager.id, e.target.value)}
                />
                %
            </Col>

            <Col>
                <Button onClick={() => onDelete(manager.id)}>Delete</Button>
            </Col>
        </Row>
    );
}

const SalesGroup = ({managers, onAdd, onPercentageChange, onDelete}) => {
    return (
        <div>
            {managers.map(manager => (
                <SalesManager
                    key={manager.id}
                    manager={manager}
                    onPercentageChange={onPercentageChange}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

const App = ({authConfig, salesGroupID}) => {
    const api = useAuthAPI();
    const [selectedManagers, setSelectedManagers] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]);

    const fetchManagers = async () => {
        try {
            const salesPersonsResponse = await api.get(`/sales-persons/`, authConfig);
            const allManagers = salesPersonsResponse.data.results;

            // Filter out the managers that are already selected
            const unsavedManagers = allManagers.filter(manager =>
                !selectedManagers.some(selected => selected.id === manager.id)
            );

            setAvailableManagers(unsavedManagers);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        (async () => {
            await fetchManagers();
        })();
    }, [selectedManagers]);  // Now it re-runs whenever selectedManagers changes


    useEffect(() => {
        console.log(availableManagers);
    }, [availableManagers]);

    useEffect(() => {
        (async () => {
            const fetchSavedManagers = async () => {
                try {
                    const response = await api.get(`/salesgroupmemberships/?salesgroup=${salesGroupID}`, authConfig);
                    const savedManagers = response.data.results; // Assuming 'results' holds the list of saved managers
                    setSelectedManagers(savedManagers);
                } catch (error) {
                    console.error('Error fetching saved managers:', error);
                }
            }

            await fetchSavedManagers();
        })()
    }, []);

    const addManager = (managerId) => {
        const managerToAdd = availableManagers.find(m => m.id === managerId);
        if (!managerToAdd) return;

        const newPercentage = 100 / (selectedManagers.length + 1);

        const updatedManagers = selectedManagers.map(m => ({
            ...m,
            percentage: newPercentage
        }));

        setSelectedManagers([
            ...updatedManagers,
            {...managerToAdd, percentage: newPercentage}
        ]);

        // Remove the added manager from availableManagers list
        const updatedAvailableManagers = availableManagers.filter(m => m.id !== managerId);
        setAvailableManagers(updatedAvailableManagers);
    };

    const handlePercentageChange = (id, value) => {
        // Similar as before: adjust percentages here to ensure sum of all is 100%
        const updatedManagers = selectedManagers.map(m =>
            m.id === id ? {...m, percentage: value} : m
        );
        setSelectedManagers(updatedManagers);
    };

    const deleteManager = (managerId) => {
        const managerToDelete = selectedManagers.find(m => m.id === managerId);

        const updatedManagers = selectedManagers.filter(m => m.id !== managerId);
        setSelectedManagers(updatedManagers);

        // Add the deleted manager back to availableManagers list
        if (managerToDelete) {
            setAvailableManagers(prev => [...prev, managerToDelete]);
        }
    };

    const saveManagers = async () => {
        // This should be set to the ID of the salesgroup you're working with.
        const SALES_GROUP_ID = salesGroupID; // Replace with actual ID or a variable that has it

        try {
            // For simplicity, we're using Promise.all to send all requests concurrently
            await Promise.all(selectedManagers.map(manager => {
                const payload = {
                    salesperson: manager.id,  // Assuming each manager has an 'id' property
                    salesgroup: SALES_GROUP_ID,
                    split_percent: manager.percentage  // Assuming each manager has a 'percentage' property
                };

                console.log("payload ::::: ", payload)

                // return false

                // If the manager has a unique ID representing an existing SalesGroupMembership entry,
                // use PUT to update. Otherwise, use POST to create a new entry.
                if (manager.membershipId) {
                    return api.put(`/salesgroupmemberships/${manager.membershipId}/`, payload, authConfig);
                } else {
                    return api.post('/salesgroupmemberships/', payload, authConfig);
                }
            }));

            console.log('Saved successfully');
        } catch (error) {
            console.error('Error saving or updating managers:', error);
        }
    };


    return (
        <>
            {/*<select onChange={e => addManager(Number(e.target.value))}>*/}
            {/*    <option value="">Select a manager to add</option>*/}
            {/*    {availableManagers.map(manager => (*/}
            {/*        <option key={manager.id} value={manager.id}>*/}
            {/*            {manager.first_name} {manager.last_name}*/}
            {/*        </option>*/}
            {/*    ))}*/}
            {/*</select>*/}


            <Col xs={24} lg={12}>
                <Card>
                    <Typography.Title level={3}>All sales persons list</Typography.Title>

                    {availableManagers.map(manager => (
                        <div key={manager.id}>
                            {manager.first_name} {manager.last_name}
                            <button onClick={() => addManager(manager.id)}>Add</button>
                        </div>
                    ))}
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card>
                    <Typography.Title level={3}>The added sales persons</Typography.Title>

                    <SalesGroup
                        managers={selectedManagers}
                        onPercentageChange={handlePercentageChange}
                        onDelete={deleteManager}
                    />

                </Card>
            </Col>

            <button
                onClick={saveManagers}
            >Save
            </button>
        </>
    );
}

const SalesGroupManagmentForEfucntional = ({id, shortname, salesPersons, salesPersonsDetails, authConfig}) => {
    const api = useAuthAPI();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [salesPersonsList, setSalesPersonsList] = useState(null);
    const [currentSalesPersonsForThisGroup, setCurrentSalesPersonsForThisGroup] = useState(salesPersonsDetails);
    const [salesPersonsIDsForThisGroup, setSalesPersonsIDsForThisGroup] = useState(salesPersons);
    const [searchSTR, setSearchSTR] = useState(null);


    const loadAllSalesPersons = async () => {
        setIsLoading(true);

        // TODO search by ID don't work because id don't be a string.
        let searchParams = ''
        if (searchSTR && searchSTR !== "") {
            searchParams = `?search=${searchSTR}`;
        }

        await api.get(`/sales-persons/${searchParams}`, authConfig)
            .then(response => {
                setSalesPersonsList(response?.data?.results.filter(salesPersonFromResponse =>
                    !salesPersonsIDsForThisGroup.includes(salesPersonFromResponse.id)));
            });

        setIsLoading(false);
    }

    const updateSalesPersonsForGroupByID = async () => {

        const salesPersonsSelected = [...salesPersonsIDsForThisGroup]; // Array of selected salesperson IDs
        const createdSalesGroupId = id;  // Assume you already have the SalesGroup ID
        console.log(currentSalesPersonsForThisGroup)
    }

    const addSalesPersonToRight = (person) => {
        setSalesPersonsIDsForThisGroup(prevState => [...prevState, person.id])
        setCurrentSalesPersonsForThisGroup(prevState => [{...person, split_percent: 50}, ...prevState]);
        setSalesPersonsList(prevState => prevState.filter(s => s.id !== person.id));
    }

    const removeSalesPersonFromRight = (person) => {
        setSalesPersonsIDsForThisGroup(prevState => prevState.filter(s => s !== person.id));
        setCurrentSalesPersonsForThisGroup(prevState => prevState.filter(s => s.id !== person.id));
        setSalesPersonsList(prevState => [{...person}, ...prevState]);
    }

    useEffect(() => {
        (async () => {
            try {
                await loadAllSalesPersons();
            } catch (err) {
                console.log(err);
            }
        })();
        // eslint-disable-next-line
    }, [searchSTR]);


    return <>
        <Spin tip="Loading..." spinning={isLoading}>
            <Button onClick={() => setIsModalOpen(prevState => !prevState)} size={'small'} type={'primary'}>
                Manage group
            </Button>
        </Spin>

        <Modal
            onOk={updateSalesPersonsForGroupByID}
            confirmLoading={isLoading}
            okText={"Save"}
            title={`Manage sale group ${shortname}`}
            open={isModalOpen}
            width={'70%'} // TODO on mobile window width
            bodyStyle={{maxHeight: "65vh"}}
            onCancel={() => setIsModalOpen(prevState => !prevState)}
        >
            <Row gutter={20}>

                <Col xs={24} lg={24}>
                    <Input placeholder={'Sales Group percent, %'}/>
                </Col>

                <App authConfig={authConfig} salesGroupID={id}/>
            </Row>
        </Modal>
    </>;
}

export default SalesGroupManagmentForEfucntional;